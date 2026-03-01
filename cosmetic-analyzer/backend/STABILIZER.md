# OCR Stabilization Layer

Reduces OCR variability so that the **same product label image consistently
produces the same ingredient list and coverage score**.

## Problem solved

| Before | After |
|--------|-------|
| Same image → 100% coverage on run A | Same image → stable ~65% coverage |
| Same image → 5% coverage on run B   | Deterministic, ≤ ±5% variance |
| "Salicilic Acid" dropped as unknown  | "Salicilic Acid" → "Salicylic Acid" |

## Architecture

```
Image
  │
  └─► Gemini Vision API  (OCR + extraction)
          │
          ▼
   ingredients_raw  ────────────────────────────────────────┐
          │                                                  │
          ▼                                                  │
  ┌───────────────────────┐                                  │
  │  OCR Stabilizer  🐍   │  POST /stabilize/single          │
  │  (Python FastAPI)     │◄─────────────────────────────────┘
  │                       │
  │  1. Text Normalization │   remove noise / lowercase / unicode
  │  2. Token Extraction   │   split at separators, discard noise
  │  3. Fuzzy Matching     │   RapidFuzz ≥ 87% → canonical INCI
  │  4. Vote Aggregation   │   count across blocks / runs
  │  5. Stability Vote     │   vote ≥ 2  OR  confidence ≥ 93%
  │  6. Metrics            │   coverage %, confidence label
  └───────────┬───────────┘
              │
              ▼
   stable_ingredients  ──► Risk Analysis Engine (Node.js)
```

## Files

| File | Purpose |
|------|---------|
| `ocr_stabilizer.py` | Core library — all 6 pipeline steps |
| `stabilizer_service.py` | FastAPI HTTP wrapper |
| `inci_dictionary.py` | ~250 canonical INCI names |
| `test_ocr_stabilizer.py` | 24 unit / integration tests |
| `requirements.txt` | Python dependencies |

## Quick start

### 1 — Install Python dependencies

```bash
cd cosmetic-analyzer/backend
pip install -r requirements.txt
```

### 2 — Start the microservice

```bash
uvicorn stabilizer_service:app --port 3002 --reload
# or
python stabilizer_service.py
```

Health check:
```bash
curl http://localhost:3002/health
# {"status":"ok","inci_dict_size":253}
```

### 3 — Start the Node.js backend (as usual)

```bash
node server.js
```

The Node.js server will automatically call the stabilizer on every
`/analyze` and `/analyze-text` request. If the Python service is not
running, analysis continues gracefully with the raw Gemini output (no crash).

### 4 — Run tests

```bash
python test_ocr_stabilizer.py
# or
python -m pytest test_ocr_stabilizer.py -v
```

---

## API reference

### `POST /stabilize`  — multi-run mode

```json
{
  "text_blocks": [
    "Water, Gl1cerin, Niacynamide, Salicilic Acid",
    "Aqua, Glycerin, Niacinamide, Salicylic Acid"
  ],
  "options": {
    "fuzzy_threshold": 87,
    "high_confidence_threshold": 93,
    "min_vote_count": 2
  }
}
```

### `POST /stabilize/single`  — single OCR output

```json
{
  "text": "Water, Gl1cerin, Niacynamide, Salicilic Acid, Ceramidess, Hyaluronic Ac1d"
}
```

### Response (both endpoints)

```json
{
  "stable_ingredients": ["Glycerin", "Niacinamide", "Salicylic Acid", "Ceramide NP", "Hyaluronic Acid"],
  "raw_detected_ingredients": ["Glycerin", "Niacinamide", "Salicylic Acid", "Ceramide NP", "Hyaluronic Acid"],
  "vote_counts": { "Glycerin": 2, "Salicylic Acid": 2 },
  "best_scores": { "Glycerin": 96, "Salicylic Acid": 98 },
  "coverage_percentage": 83.3,
  "confidence_level": "High",
  "pass_reasons": {
    "Glycerin": "vote+confidence",
    "Salicylic Acid": "vote+confidence"
  },
  "blocks_processed": 2,
  "config": {
    "fuzzy_match_threshold": 87,
    "high_confidence_threshold": 93,
    "min_vote_count": 2
  }
}
```

---

## Thresholds

| Parameter | Default | Notes |
|-----------|---------|-------|
| `FUZZY_MATCH_THRESHOLD` | **87** | Lower → more matches but more false positives. Recommended range: 83–90. |
| `HIGH_CONFIDENCE_THRESHOLD` | **93** | Single-run bypass gate. Keep ≥ 90 to avoid noise. |
| `MIN_VOTE_COUNT` | **2** | Requires ≥ 2 independent OCR blocks to agree. Use `1` for single-block mode. |
| `MIN_TOKEN_LENGTH` | **3** | Drop tokens shorter than this (noise/abbreviations). |

### Tuning guide

- **Coverage too low (many ingredients missed):** lower `FUZZY_MATCH_THRESHOLD` to 83.
- **False positives (wrong ingredients detected):** raise threshold to 90–92.
- **Single-image only (no multi-run):** use `/stabilize/single` — vote gate is automatically set to `min_vote_count=1`.
- **High OCR noise environment:** lower `MIN_TOKEN_LENGTH` to 2, raise `HIGH_CONFIDENCE_THRESHOLD` to 95.

---

## Python usage (library mode — no HTTP)

```python
from ocr_stabilizer import stabilize, stabilize_single
from inci_dictionary import INCI_DICTIONARY

# Multi-run: list of OCR strings (one per Gemini call / crop)
result = stabilize(
    ["Water, Glicerin, Niacynamide", "Aqua, Glycerin, Niacinamide"],
    INCI_DICTIONARY
)
print(result["stable_ingredients"])   # ['Glycerin', 'Niacinamide']
print(result["coverage_percentage"])  # e.g. 66.7
print(result["confidence_level"])     # 'Medium'

# Single block
result = stabilize_single(
    "Water, Salicilic Acid, Ceramidess, Hyaluronic Ac1d",
    INCI_DICTIONARY
)
```

---

## Environment variables (`.env`)

```dotenv
STABILIZER_ENABLED=true      # set to false to bypass
STABILIZER_URL=http://localhost:3002
```
