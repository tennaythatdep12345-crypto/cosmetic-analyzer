"""
Tests for ocr_stabilizer.py
============================
Run: python -m pytest test_ocr_stabilizer.py -v
     or: python test_ocr_stabilizer.py
"""

from __future__ import annotations

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from inci_dictionary import INCI_DICTIONARY
from ocr_stabilizer import (
    StabilizerConfig,
    aggregate_blocks,
    apply_vote_filter,
    extract_tokens,
    fuzzy_match_ingredient,
    normalize_text,
    process_single_block,
    stabilize,
    stabilize_single,
)

# ─────────────────────────────────────────────────────────────────────────────
# 1. Text Normalization
# ─────────────────────────────────────────────────────────────────────────────

def test_normalize_removes_noise():
    raw = "  Ingredients: Aqua,  Glycerin!!, \nNiacinamide@5%  "
    result = normalize_text(raw)
    assert "aqua" in result
    assert "glycerin" in result
    assert "niacinamide" in result
    assert "%" not in result
    assert "!" not in result
    assert "@" not in result


def test_normalize_handles_unicode():
    raw = "Ácido Salicílico, Cérémide"
    result = normalize_text(raw)
    assert "cido" in result or "salicilico" in result


def test_normalize_empty():
    assert normalize_text("") == ""
    assert normalize_text(None) == ""


def test_normalize_separator_variants():
    raw = "Aqua; Glycerin | Phenoxyethanol • Niacinamide"
    result = normalize_text(raw)
    tokens = [t.strip() for t in result.split(",") if t.strip()]
    assert len(tokens) >= 4


# ─────────────────────────────────────────────────────────────────────────────
# 2. Token Extraction
# ─────────────────────────────────────────────────────────────────────────────

def test_extract_tokens_basic():
    text = "aqua, glycerin, niacinamide, phenoxyethanol"
    tokens = extract_tokens(text)
    assert "aqua" in tokens
    assert "glycerin" in tokens


def test_extract_tokens_discards_percent():
    text = "aqua, 5%, glycerin"
    tokens = extract_tokens(text)
    assert "5%" not in tokens
    assert "5" not in tokens


def test_extract_tokens_discards_header():
    # extract_tokens expects already-normalized text; normalize first
    normalized = normalize_text("ingredients: aqua, glycerin")
    tokens = extract_tokens(normalized)
    assert "ingredients" not in tokens
    assert "aqua" in tokens


def test_extract_tokens_min_length():
    text = "a, b, aq, aqua"
    tokens = extract_tokens(text)
    assert "a" not in tokens
    assert "b" not in tokens
    assert "aq" not in tokens  # len < MIN_TOKEN_LENGTH
    assert "aqua" in tokens


# ─────────────────────────────────────────────────────────────────────────────
# 3. Fuzzy Matching
# ─────────────────────────────────────────────────────────────────────────────

def test_exact_match():
    result = fuzzy_match_ingredient("salicylic acid", INCI_DICTIONARY, threshold=87)
    assert result.matched_inci == "Salicylic Acid"
    assert result.score >= 95


def test_typo_correction_salicylic():
    # Common OCR misspelling
    result = fuzzy_match_ingredient("salicilic acid", INCI_DICTIONARY, threshold=87)
    assert result.matched_inci == "Salicylic Acid"
    assert result.score >= 87


def test_typo_ceramides():
    result = fuzzy_match_ingredient("ceramidess", INCI_DICTIONARY, threshold=85)
    assert result.matched_inci is not None
    assert "ceramide" in result.matched_inci.lower()


def test_no_match_below_threshold():
    result = fuzzy_match_ingredient("xyzrandomtoken123", INCI_DICTIONARY, threshold=87)
    assert result.matched_inci is None


def test_niacinamide_variants():
    for variant in ["niacinamid", "niacynamide", "nicotinamide"]:
        result = fuzzy_match_ingredient(variant, INCI_DICTIONARY, threshold=85)
        assert result.matched_inci is not None, f"Should match: {variant}"


def test_glycerin_variants():
    for variant in ["glycerine", "glicerin", "glycerol"]:
        result = fuzzy_match_ingredient(variant, INCI_DICTIONARY, threshold=85)
        assert result.matched_inci is not None, f"Should match: {variant}"


# ─────────────────────────────────────────────────────────────────────────────
# 4. Single Block Processing
# ─────────────────────────────────────────────────────────────────────────────

GOOD_LABEL = (
    "Water, Glycerin, Niacinamide, Salicylic Acid, Phenoxyethanol, "
    "Ceramide NP, Hyaluronic Acid, Panthenol, Xanthan Gum, Citric Acid"
)

OCR_NOISY_LABEL = (
    "Wat3r, Gl1cerin, Niacynamide, Salicilic Ac1d, Phenoxyethano1, "
    "Ceramidess, Hyaluronic Ac!d, Panth3nol, Xantham Gum, C1tric Acid"
)


def test_single_block_clean_label():
    result = process_single_block(GOOD_LABEL, INCI_DICTIONARY)
    names = [m.matched_inci for m in result.matches if m.matched_inci]
    assert "Glycerin" in names
    assert "Niacinamide" in names
    assert "Salicylic Acid" in names


def test_single_block_noisy_label():
    result = process_single_block(OCR_NOISY_LABEL, INCI_DICTIONARY)
    names = [m.matched_inci for m in result.matches if m.matched_inci]
    # At least half should survive noise
    assert len(names) >= 4, f"Expected ≥4 matches from noisy label, got {len(names)}: {names}"


# ─────────────────────────────────────────────────────────────────────────────
# 5. Multi-run Aggregation & Voting
# ─────────────────────────────────────────────────────────────────────────────

BLOCK_A = "Water, Glycerin, Niacinamide, Salicylic Acid, Ceramide NP"
BLOCK_B = "Aqua, Glicerin, Niacynamide, Salicilic Acid, Ceramidess"
BLOCK_C = "Water, Glycerine, Nicotinamide, Salicylic Acid, Ceramide NP"


def test_vote_gate_confirms_across_runs():
    result = stabilize([BLOCK_A, BLOCK_B, BLOCK_C], INCI_DICTIONARY)
    stable = result["stable_ingredients"]
    # Salicylic Acid appears in all 3 blocks → must be stable
    assert "Salicylic Acid" in stable
    # Glycerin appears in all 3 (with variants) → must be stable
    assert "Glycerin" in stable or "Glycerol" in stable


def test_vote_counts_populated():
    result = stabilize([BLOCK_A, BLOCK_B, BLOCK_C], INCI_DICTIONARY)
    assert result["vote_counts"]
    assert result["blocks_processed"] == 3


def test_single_run_high_confidence_passes():
    """With 1 block and min_vote=1, high-conf ingredients should pass."""
    result = stabilize_single(GOOD_LABEL, INCI_DICTIONARY)
    stable = result["stable_ingredients"]
    assert len(stable) >= 4


def test_coverage_not_zero_on_good_label():
    result = stabilize_single(GOOD_LABEL, INCI_DICTIONARY)
    assert result["coverage_percentage"] > 0


def test_confidence_high_on_clean_label():
    # Use 3 identical clean blocks to guarantee votes
    result = stabilize([GOOD_LABEL, GOOD_LABEL, GOOD_LABEL], INCI_DICTIONARY)
    assert result["confidence_level"] in ("High", "Medium")


def test_empty_input():
    result = stabilize([], INCI_DICTIONARY)
    assert result["stable_ingredients"] == []
    assert result["confidence_level"] == "Low"
    assert result["coverage_percentage"] == 0.0


def test_output_shape():
    result = stabilize([BLOCK_A], INCI_DICTIONARY)
    required_keys = {
        "stable_ingredients", "raw_detected_ingredients",
        "vote_counts", "best_scores",
        "coverage_percentage", "confidence_level",
        "pass_reasons", "blocks_processed", "config",
    }
    assert required_keys.issubset(result.keys())


# ─────────────────────────────────────────────────────────────────────────────
# 6. End-to-end scenario — the original problem
# ─────────────────────────────────────────────────────────────────────────────

def test_same_image_two_runs_same_output():
    """Simulate the same image being OCR'd twice with minor variation."""
    run1 = "Water, Glycerin, Niacinamide 10%, Salicylic Acid, Ceramide NP, Panthenol"
    run2 = "Aqua, Gl1cerin, Niacynamide, Salicilic Acid, Ceramide NP, Panth3nol"

    res1 = stabilize([run1, run2], INCI_DICTIONARY)
    res2 = stabilize([run2, run1], INCI_DICTIONARY)  # order swapped

    # Both should converge to the same stable set
    assert set(res1["stable_ingredients"]) == set(res2["stable_ingredients"])


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import traceback

    tests = [
        test_normalize_removes_noise,
        test_normalize_handles_unicode,
        test_normalize_empty,
        test_normalize_separator_variants,
        test_extract_tokens_basic,
        test_extract_tokens_discards_percent,
        test_extract_tokens_discards_header,
        test_extract_tokens_min_length,
        test_exact_match,
        test_typo_correction_salicylic,
        test_typo_ceramides,
        test_no_match_below_threshold,
        test_niacinamide_variants,
        test_glycerin_variants,
        test_single_block_clean_label,
        test_single_block_noisy_label,
        test_vote_gate_confirms_across_runs,
        test_vote_counts_populated,
        test_single_run_high_confidence_passes,
        test_coverage_not_zero_on_good_label,
        test_confidence_high_on_clean_label,
        test_empty_input,
        test_output_shape,
        test_same_image_two_runs_same_output,
    ]

    passed = 0
    failed = 0
    for test_fn in tests:
        try:
            test_fn()
            print(f"  ✓  {test_fn.__name__}")
            passed += 1
        except Exception:
            print(f"  ✗  {test_fn.__name__}")
            traceback.print_exc()
            failed += 1

    print(f"\n{'─'*50}")
    print(f"Results: {passed} passed, {failed} failed out of {len(tests)} tests")
    if failed:
        sys.exit(1)
