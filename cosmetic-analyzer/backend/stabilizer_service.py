"""
Stabilizer Microservice
=======================
FastAPI HTTP service exposing the OCR Stabilization Layer.
The Node.js backend calls this service after receiving OCR text
from Gemini, before running risk analysis.

Start: uvicorn stabilizer_service:app --port 3002 --reload

Endpoints
---------
POST /stabilize
    Body: { "text_blocks": ["..."], "options": { ... } }
    Returns stabilized ingredient list + metrics.

POST /stabilize/single
    Body: { "text": "...", "options": { ... } }
    Convenience wrapper for a single OCR text block.

GET  /health
    Returns { "status": "ok" }
"""

from __future__ import annotations

from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from inci_dictionary import INCI_DICTIONARY
from ocr_stabilizer import StabilizerConfig, stabilize, stabilize_single

# ─────────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="OCR Stabilizer Service",
    description="Post-OCR ingredient stabilization for cosmetic product analysis.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────────────────────────────
# Request / Response schemas
# ─────────────────────────────────────────────────────────────────────────────

class StabilizerOptions(BaseModel):
    fuzzy_threshold: int = Field(
        default=StabilizerConfig.FUZZY_MATCH_THRESHOLD,
        ge=50, le=100,
        description="Min similarity score (0–100) to accept a fuzzy match.",
    )
    high_confidence_threshold: int = Field(
        default=StabilizerConfig.HIGH_CONFIDENCE_THRESHOLD,
        ge=50, le=100,
        description="Score at which a single-run match bypasses the vote gate.",
    )
    min_vote_count: int = Field(
        default=StabilizerConfig.MIN_VOTE_COUNT,
        ge=1, le=10,
        description="Number of blocks that must agree for a 'vote' pass.",
    )


class MultiBlockRequest(BaseModel):
    text_blocks: list[str] = Field(
        ...,
        min_length=1,
        description="List of raw OCR strings — one per run / text region.",
    )
    options: Optional[StabilizerOptions] = None


class SingleBlockRequest(BaseModel):
    text: str = Field(..., description="Raw OCR text from a single pass.")
    options: Optional[StabilizerOptions] = None


class StabilizerResponse(BaseModel):
    stable_ingredients: list[str]
    raw_detected_ingredients: list[str]
    vote_counts: dict[str, int]
    best_scores: dict[str, int]
    coverage_percentage: float
    confidence_level: str
    pass_reasons: dict[str, str]
    blocks_processed: int
    config: dict


# ─────────────────────────────────────────────────────────────────────────────
# Routes
# ─────────────────────────────────────────────────────────────────────────────

@app.get("/health")
def health() -> dict:
    return {"status": "ok", "inci_dict_size": len(INCI_DICTIONARY)}


@app.post("/stabilize", response_model=StabilizerResponse)
def stabilize_multi(req: MultiBlockRequest) -> dict:
    """Stabilize ingredients from multiple OCR blocks / runs."""
    opts = req.options or StabilizerOptions()
    try:
        return stabilize(
            req.text_blocks,
            INCI_DICTIONARY,
            fuzzy_threshold=opts.fuzzy_threshold,
            high_confidence_threshold=opts.high_confidence_threshold,
            min_vote_count=opts.min_vote_count,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@app.post("/stabilize/single", response_model=StabilizerResponse)
def stabilize_one(req: SingleBlockRequest) -> dict:
    """Stabilize ingredients from a single OCR text block."""
    opts = req.options or StabilizerOptions()
    try:
        return stabilize_single(
            req.text,
            INCI_DICTIONARY,
            fuzzy_threshold=opts.fuzzy_threshold,
            high_confidence_threshold=opts.high_confidence_threshold,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


# ─────────────────────────────────────────────────────────────────────────────
# Run directly: python stabilizer_service.py
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("stabilizer_service:app", host="0.0.0.0", port=3002, reload=True)
