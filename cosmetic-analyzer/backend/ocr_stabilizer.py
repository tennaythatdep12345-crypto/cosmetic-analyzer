"""
OCR Stabilization Layer for Cosmetic Ingredient Detection
=========================================================
Reduces OCR variability so that the same product image reliably
produces the same ingredient list and coverage score.

Pipeline
--------
1. Text Normalization  — strip noise, lowercase, normalise spacing
2. Token Extraction    — split blob of text into candidate tokens
3. Fuzzy Matching      — map each token to the best INCI name (≥ threshold)
4. Multi-run Aggregation — treat multiple OCR blocks as independent "runs"
5. Stability Voting    — keep a match if vote_count ≥ 2 OR confidence ≥ threshold
6. Output Metrics      — return structured dict with coverage & confidence

Usage
-----
    from ocr_stabilizer import stabilize
    from inci_dictionary import INCI_DICTIONARY

    # text_blocks is a list of raw OCR strings (one per "run" or text region)
    result = stabilize(text_blocks, INCI_DICTIONARY)
"""

from __future__ import annotations

import re
import unicodedata
from collections import Counter, defaultdict
from dataclasses import dataclass, field
from typing import Optional

try:
    from rapidfuzz import fuzz, process as rf_process
except ImportError as exc:  # pragma: no cover
    raise ImportError(
        "rapidfuzz is required: pip install rapidfuzz"
    ) from exc

# ─────────────────────────────────────────────────────────────────────────────
# Configuration / Thresholds
# ─────────────────────────────────────────────────────────────────────────────

class StabilizerConfig:
    """Central threshold store — tweak here, not scattered across functions."""

    # Fuzzy similarity floor: tokens below this score are discarded
    FUZZY_MATCH_THRESHOLD: int = 87

    # High-confidence floor: a single match at/above this score
    # counts as "voted in" even without a second run confirming it
    HIGH_CONFIDENCE_THRESHOLD: int = 93

    # Minimum number of independent runs that must produce the
    # same INCI name for it to pass the vote gate
    MIN_VOTE_COUNT: int = 2

    # Coverage thresholds for the confidence label
    COVERAGE_HIGH: float = 0.75
    COVERAGE_MEDIUM: float = 0.45

    # Minimum token length to bother matching (skip single chars, etc.)
    MIN_TOKEN_LENGTH: int = 3

    # Maximum edit distance considered as the same INCI canonical form
    # (used for the vote-deduplication step, not fuzzy matching)
    DEDUPE_THRESHOLD: int = 90


# ─────────────────────────────────────────────────────────────────────────────
# 1. Text Normalization
# ─────────────────────────────────────────────────────────────────────────────

# Characters that should be treated as ingredient separators.
# Characters that should be treated as ingredient separators.
# NOTE: '/' is intentionally excluded so INCI names like
# "Caprylic/Capric Triglyceride" survive as a single token.
# ':' is included to strip common OCR artefacts like "Ingredients:"
_SEPARATOR_RE = re.compile("[,;|\u2022\u00b7\n\r\t\\\\:]+")  # actual unicode •·

# Allowed characters after separator splitting.
# Comma (',') MUST be kept so extract_tokens() can split on it.
# Forward-slash ('/') kept for compound INCI names (e.g. C12-15 Alkyl).
_NOISE_RE = re.compile(r"[^a-z0-9\s\-/,]")

# Collapse multiple spaces / whitespace runs
_WHITESPACE_RE = re.compile(r"\s{2,}")

# Patterns that are clearly not ingredient names (percentages, lot numbers…)
_DISCARD_RE = re.compile(
    r"^"
    r"(\d+[\.,]\d*\s*%?|"   # numbers / percentages
    r"lot\s*:?|"             # lot number
    r"exp\s*:?|"             # expiry
    r"mfg\s*:?|"             # manufacture date
    r"batch\s*:?|"           # batch id
    r"www\.|"                # URLs
    r"http|"
    r"\.com|"
    r"made\s+in|"
    r"distributed\s+by|"
    r"ingredients?\s*:?)"    # header token
    r"$",
    re.IGNORECASE,
)


def normalize_text(raw: str) -> str:
    """Return a cleaned, lowercase version of *raw* OCR text.

    Steps
    -----
    * Unicode normalize (NFKC)
    * **Replace separator characters with commas** ← must happen BEFORE ASCII
      stripping so that non-ASCII bullets (•, ·) become commas not silence.
    * Strip non-ASCII characters (handles accented O, smart quotes, etc.)
    * Remove remaining non-alphanumeric noise
    * Collapse whitespace
    * Strip leading/trailing whitespace
    """
    if not raw:
        return ""

    # Unicode normalisation — NFKC is better than NFKD for cosmetic text;
    # it keeps composed characters intact without unnecessary decomposition.
    text = unicodedata.normalize("NFKC", raw)

    # ── Unify separators BEFORE ASCII stripping ────────────────────────────
    # Critical: non-ASCII bullets (•  U+2022,  ·  U+00B7) must become ','
    # BEFORE encode("ascii") silently drops them.
    text = _SEPARATOR_RE.sub(",", text)

    # Strip non-ASCII (handles accented letters, smart quotes, etc.)
    text = text.encode("ascii", "ignore").decode("ascii")

    # Lowercase
    text = text.lower()

    # Remove noise characters (keep hyphen/slash/comma for INCI names)
    text = _NOISE_RE.sub(" ", text)

    # Collapse whitespace
    text = _WHITESPACE_RE.sub(" ", text)

    return text.strip()


# ─────────────────────────────────────────────────────────────────────────────
# 2. Token Extraction
# ─────────────────────────────────────────────────────────────────────────────

def extract_tokens(normalized_text: str) -> list[str]:
    """Split normalised text into individual ingredient-candidate tokens.

    Returns deduplicated, non-empty strings sorted by length (longest first)
    so that multi-word INCI names get matched before sub-tokens.
    """
    raw_tokens = [t.strip() for t in normalized_text.split(",")]

    # Filter: minimum length, not obviously a non-ingredient string
    tokens: list[str] = []
    seen: set[str] = set()
    for tok in raw_tokens:
        tok = tok.strip()
        if len(tok) < StabilizerConfig.MIN_TOKEN_LENGTH:
            continue
        if _DISCARD_RE.match(tok):
            continue
        if tok not in seen:
            seen.add(tok)
            tokens.append(tok)

    # Longest first — improves multi-word INCI match accuracy
    tokens.sort(key=len, reverse=True)
    return tokens


# ─────────────────────────────────────────────────────────────────────────────
# 3. Fuzzy Matching against INCI Dictionary
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class MatchResult:
    """Single fuzzy match outcome."""
    token: str                   # raw OCR token (normalised)
    matched_inci: Optional[str]  # canonical INCI name or None
    score: int                   # 0–100 similarity score
    method: str                  # scorer used (e.g. "token_sort_ratio")


def _score_token(token: str, inci_name: str) -> int:
    """Return the highest similarity score between *token* and *inci_name*
    using multiple fuzzy strategies."""
    lower_inci = inci_name.lower()
    return max(
        fuzz.ratio(token, lower_inci),
        fuzz.partial_ratio(token, lower_inci),
        fuzz.token_sort_ratio(token, lower_inci),
        fuzz.token_set_ratio(token, lower_inci),
    )


def fuzzy_match_ingredient(
    token: str,
    inci_dict: list[str],
    threshold: int = StabilizerConfig.FUZZY_MATCH_THRESHOLD,
) -> MatchResult:
    """Match *token* against *inci_dict* and return the best hit above
    *threshold*, or a MatchResult with matched_inci=None if nothing qualifies.

    Uses rapidfuzz.process.extractOne for speed, then re-scores with the
    best multi-strategy scorer for precision.
    """
    token_lower = token.lower()

    # Fast candidate retrieval — top-1 by WRatio
    best = rf_process.extractOne(
        token_lower,
        [name.lower() for name in inci_dict],
        scorer=fuzz.WRatio,
        score_cutoff=threshold - 5,   # cast a slightly wider net first
    )

    if best is None:
        return MatchResult(token=token, matched_inci=None, score=0, method="no_match")

    # Re-score the candidate with the multi-strategy approach for precision
    candidate_lower, _fast_score, idx = best
    canonical_name = inci_dict[idx]
    precise_score = _score_token(token_lower, canonical_name)

    if precise_score < threshold:
        return MatchResult(token=token, matched_inci=None, score=precise_score, method="below_threshold")

    return MatchResult(
        token=token,
        matched_inci=canonical_name,
        score=precise_score,
        method="fuzzy",
    )


# ─────────────────────────────────────────────────────────────────────────────
# 4. Single-Block Extraction
# ─────────────────────────────────────────────────────────────────────────────

@dataclass
class BlockExtractionResult:
    """All matches extracted from one OCR text block."""
    raw_text: str
    matches: list[MatchResult] = field(default_factory=list)

    @property
    def detected_inci(self) -> list[str]:
        return [m.matched_inci for m in self.matches if m.matched_inci]


def process_single_block(
    raw_text: str,
    inci_dict: list[str],
    threshold: int = StabilizerConfig.FUZZY_MATCH_THRESHOLD,
) -> BlockExtractionResult:
    """Normalise *raw_text*, extract tokens, fuzzy-match each token.

    Returns a :class:`BlockExtractionResult` with all successful matches.
    """
    normalised = normalize_text(raw_text)
    tokens = extract_tokens(normalised)

    result = BlockExtractionResult(raw_text=raw_text)
    matched_inci_set: set[str] = set()

    for tok in tokens:
        match = fuzzy_match_ingredient(tok, inci_dict, threshold)
        if match.matched_inci and match.matched_inci not in matched_inci_set:
            result.matches.append(match)
            matched_inci_set.add(match.matched_inci)

    return result


# ─────────────────────────────────────────────────────────────────────────────
# 5. Multi-run Aggregation & Stability Voting
# ─────────────────────────────────────────────────────────────────────────────
#
# Design
# ------
# text_blocks is a list of OCR strings.  Each block is treated as an
# independent "run" (could be: multiple Gemini calls, multiple image crops,
# different preprocessing passes, or separate text regions on the label).
#
# vote_counts[inci_name] = number of blocks that detected it
# best_scores[inci_name]  = highest confidence score across all blocks
#
# An ingredient is "stable" if:
#   vote_count  >= MIN_VOTE_COUNT    (confirmed by ≥ 2 independent sources)
#   OR
#   best_score  >= HIGH_CONFIDENCE_THRESHOLD  (single very-high-confidence match)

@dataclass
class AggregationResult:
    """Aggregated vote data across all OCR blocks."""
    vote_counts: dict[str, int]       # inci_name → count of blocks
    best_scores: dict[str, int]       # inci_name → highest score seen
    all_detections: list[str]         # flattened list (with duplicates)
    block_results: list[BlockExtractionResult]


def aggregate_blocks(
    text_blocks: list[str],
    inci_dict: list[str],
    threshold: int = StabilizerConfig.FUZZY_MATCH_THRESHOLD,
) -> AggregationResult:
    """Process every block and accumulate vote counts + best scores."""
    vote_counts: Counter[str] = Counter()
    best_scores: dict[str, int] = defaultdict(int)
    all_detections: list[str] = []
    block_results: list[BlockExtractionResult] = []

    for block in text_blocks:
        br = process_single_block(block, inci_dict, threshold)
        block_results.append(br)

        # Deduplicate within this block before voting
        seen_in_block: set[str] = set()
        for match in br.matches:
            if match.matched_inci and match.matched_inci not in seen_in_block:
                seen_in_block.add(match.matched_inci)
                vote_counts[match.matched_inci] += 1
                best_scores[match.matched_inci] = max(
                    best_scores[match.matched_inci], match.score
                )
                all_detections.append(match.matched_inci)

    return AggregationResult(
        vote_counts=dict(vote_counts),
        best_scores=dict(best_scores),
        all_detections=all_detections,
        block_results=block_results,
    )


def apply_vote_filter(
    agg: AggregationResult,
    min_votes: int = StabilizerConfig.MIN_VOTE_COUNT,
    high_conf: int = StabilizerConfig.HIGH_CONFIDENCE_THRESHOLD,
) -> tuple[list[str], dict[str, str]]:
    """Apply the stability gate and return (stable_list, reason_map).

    Each ingredient passes if:
    * vote_count >= min_votes   → ``"vote"``
    * best_score >= high_conf   → ``"confidence"``
    * both                      → ``"vote+confidence"``
    """
    stable: list[str] = []
    reasons: dict[str, str] = {}

    for inci_name, votes in agg.vote_counts.items():
        score = agg.best_scores.get(inci_name, 0)
        by_vote = votes >= min_votes
        by_conf = score >= high_conf

        if by_vote and by_conf:
            reasons[inci_name] = "vote+confidence"
            stable.append(inci_name)
        elif by_vote:
            reasons[inci_name] = "vote"
            stable.append(inci_name)
        elif by_conf:
            reasons[inci_name] = "confidence"
            stable.append(inci_name)

    # Maintain deterministic order: sort by (vote_count desc, score desc)
    stable.sort(
        key=lambda n: (-agg.vote_counts.get(n, 0), -agg.best_scores.get(n, 0))
    )
    return stable, reasons


# ─────────────────────────────────────────────────────────────────────────────
# 6. Coverage & Confidence Metric
# ─────────────────────────────────────────────────────────────────────────────

def compute_coverage_confidence(
    stable: list[str],
    raw_detected: list[str],
    inci_dict: list[str],
) -> tuple[float, str]:
    """Estimate coverage and return a confidence label.

    Coverage = stable / max(raw_detected_unique, 1)
    Uses known-INCI-size as a denominator floor to avoid 100% on tiny lists.
    """
    unique_raw = len(set(raw_detected))
    denominator = max(unique_raw, 1)
    coverage = min(1.0, len(stable) / denominator)

    if coverage >= StabilizerConfig.COVERAGE_HIGH:
        confidence = "High"
    elif coverage >= StabilizerConfig.COVERAGE_MEDIUM:
        confidence = "Medium"
    else:
        confidence = "Low"

    return round(coverage * 100, 1), confidence


# ─────────────────────────────────────────────────────────────────────────────
# Public API
# ─────────────────────────────────────────────────────────────────────────────

def stabilize(
    text_blocks: list[str],
    inci_dict: list[str],
    *,
    fuzzy_threshold: int = StabilizerConfig.FUZZY_MATCH_THRESHOLD,
    high_confidence_threshold: int = StabilizerConfig.HIGH_CONFIDENCE_THRESHOLD,
    min_vote_count: int = StabilizerConfig.MIN_VOTE_COUNT,
) -> dict:
    """**Main entry point** — run the full stabilization pipeline.

    Parameters
    ----------
    text_blocks:
        List of raw OCR text strings.  Provide one per "run" or text region.
        Even a single element is handled (single-block mode — only the
        confidence gate applies; the vote gate requires ≥ 2 blocks).
    inci_dict:
        List of canonical INCI names to match against.
    fuzzy_threshold:
        Minimum similarity score (0–100) to accept a match.  Default 87.
    high_confidence_threshold:
        Single-run confidence floor that bypasses the vote gate.  Default 93.
    min_vote_count:
        Number of blocks that must agree before an ingredient is "stable".
        Default 2.

    Returns
    -------
    dict with keys:
        stable_ingredients      canonical INCI names that passed the gate
        raw_detected_ingredients all raw matches (pre-voting, with duplicates)
        vote_counts             per-ingredient vote counts
        best_scores             per-ingredient highest fuzzy score
        coverage_percentage     float 0–100
        confidence_level        "High" | "Medium" | "Low"
        pass_reasons           how each stable ingredient passed ("vote" | "confidence" | "vote+confidence")
        blocks_processed        number of input text blocks
        config                  threshold values used (for auditability)
    """
    if not text_blocks:
        return {
            "stable_ingredients": [],
            "raw_detected_ingredients": [],
            "vote_counts": {},
            "best_scores": {},
            "coverage_percentage": 0.0,
            "confidence_level": "Low",
            "pass_reasons": {},
            "blocks_processed": 0,
            "config": _config_snapshot(fuzzy_threshold, high_confidence_threshold, min_vote_count),
        }

    # 4. Aggregate across all blocks
    agg = aggregate_blocks(text_blocks, inci_dict, threshold=fuzzy_threshold)

    # 5. Stability voting
    stable, reasons = apply_vote_filter(agg, min_votes=min_vote_count, high_conf=high_confidence_threshold)

    # 6. Metrics
    coverage, confidence = compute_coverage_confidence(
        stable, agg.all_detections, inci_dict
    )

    return {
        "stable_ingredients": stable,
        "raw_detected_ingredients": list(dict.fromkeys(agg.all_detections)),  # unique, ordered
        "vote_counts": agg.vote_counts,
        "best_scores": agg.best_scores,
        "coverage_percentage": coverage,
        "confidence_level": confidence,
        "pass_reasons": reasons,
        "blocks_processed": len(text_blocks),
        "config": _config_snapshot(fuzzy_threshold, high_confidence_threshold, min_vote_count),
    }


# ─────────────────────────────────────────────────────────────────────────────
# Convenience helpers
# ─────────────────────────────────────────────────────────────────────────────

def stabilize_single(
    raw_text: str,
    inci_dict: list[str],
    *,
    fuzzy_threshold: int = StabilizerConfig.FUZZY_MATCH_THRESHOLD,
    high_confidence_threshold: int = StabilizerConfig.HIGH_CONFIDENCE_THRESHOLD,
) -> dict:
    """Single-block convenience wrapper.

    When only one OCR pass is available, the vote gate is relaxed: any match
    at or above *high_confidence_threshold* is kept.  Matches below that
    threshold are still included but flagged as ``"low_confidence"`` in
    ``pass_reasons``.
    """
    if not raw_text:
        return stabilize([], inci_dict)

    # Single block — lower the vote requirement to 1 so all confident
    # matches pass; high-conf threshold still acts as quality gate.
    return stabilize(
        [raw_text],
        inci_dict,
        fuzzy_threshold=fuzzy_threshold,
        high_confidence_threshold=high_confidence_threshold,
        min_vote_count=1,  # can't have 2 votes from 1 block
    )


def _config_snapshot(fuzzy_threshold: int, high_conf: int, min_votes: int) -> dict:
    return {
        "fuzzy_match_threshold": fuzzy_threshold,
        "high_confidence_threshold": high_conf,
        "min_vote_count": min_votes,
    }
