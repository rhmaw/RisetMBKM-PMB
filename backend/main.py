from __future__ import annotations

import json
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any

import torch
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from transformers import AutoModelForSequenceClassification, AutoTokenizer

BASE_DIR = Path(__file__).resolve().parent


def resolve_path(value: str | None, default: str) -> Path:
    raw = Path(value or default).expanduser()
    return raw.resolve() if raw.is_absolute() else (BASE_DIR / raw).resolve()


MODEL_DIR = resolve_path(os.getenv("MODEL_DIR"), "model_final_pmb")
LABEL_MAPPING_PATH = resolve_path(os.getenv("LABEL_MAPPING_PATH"), "label_mapping.json")
MAX_LENGTH = max(16, min(int(os.getenv("MAX_LENGTH", "256")), 512))
REQUIRE_AUTH = os.getenv("REQUIRE_AUTH", "true").lower() in {"1", "true", "yes"}
FIREBASE_ADMIN_EMAILS = {
    value.strip().lower()
    for value in os.getenv("FIREBASE_ADMIN_EMAILS", "").split(",")
    if value.strip()
}
_FIREBASE_JWK_CLIENT = None
_FIREBASE_JWK_URL = "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "amikom-pmb-insight")

_DEFAULT_ORIGINS = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173"
CORS_ORIGINS = [x.strip().rstrip("/") for x in os.getenv("CORS_ORIGINS", _DEFAULT_ORIGINS).split(",") if x.strip()]

_model = None
_tokenizer = None
_id_to_canonical_label: dict[int, str] = {}
_device = "cpu"
_model_error: str | None = None


class PredictRequest(BaseModel):
    text: str = Field(min_length=1, max_length=10000, description="Komentar yang ingin diklasifikasikan")


class BatchPredictRequest(BaseModel):
    texts: list[str] = Field(min_length=1, max_length=64, description="Maksimal 64 komentar per permintaan")


def _canonical_label(label: Any) -> str | None:
    value = str(label).strip().lower().replace("_", " ").replace("-", " ")
    compact = " ".join(value.split())
    if any(token in compact for token in ("positive", "positif", "positif")):
        return "Positive"
    if any(token in compact for token in ("negative", "negatif")):
        return "Negative"
    if any(token in compact for token in ("neutral", "netral", "netral")):
        return "Neutral"
    return None


def _mapping_from_obj(obj: Any) -> dict[int, str] | None:
    """Read common id2label, label2id, list, or label->id mapping formats."""
    if isinstance(obj, list) and obj and all(isinstance(x, (str, int)) for x in obj):
        return {i: str(label) for i, label in enumerate(obj)}
    if not isinstance(obj, dict):
        return None

    for key in ("id2label", "id_to_label", "id_to_name", "labels_by_id", "labels"):
        value = obj.get(key)
        if isinstance(value, dict):
            out: dict[int, str] = {}
            for k, v in value.items():
                try:
                    out[int(k)] = str(v)
                except (ValueError, TypeError):
                    pass
            if out:
                return out
        if isinstance(value, list):
            parsed = _mapping_from_obj(value)
            if parsed:
                return parsed

    for key in ("label2id", "label_to_id", "name_to_id", "labels_to_id"):
        value = obj.get(key)
        if isinstance(value, dict):
            out = {}
            for label, idx in value.items():
                try:
                    out[int(idx)] = str(label)
                except (ValueError, TypeError):
                    pass
            if out:
                return out

    # A simple object such as {"Negative": 0, "Neutral": 1, "Positive": 2}
    if obj and all(isinstance(v, (int, float)) or (isinstance(v, str) and v.isdigit()) for v in obj.values()):
        out = {}
        for label, idx in obj.items():
            try:
                out[int(idx)] = str(label)
            except (ValueError, TypeError):
                pass
        if out:
            return out

    # A simple object such as {"0": "Negative", "1": "Neutral", "2": "Positive"}
    if obj and all(str(k).isdigit() for k in obj.keys()):
        try:
            return {int(k): str(v) for k, v in obj.items()}
        except (ValueError, TypeError):
            pass

    # Common nested wrapper formats.
    for key in ("mapping", "label_mapping", "class_mapping", "sentiment_mapping", "data"):
        if key in obj:
            parsed = _mapping_from_obj(obj[key])
            if parsed:
                return parsed
    return None


def _load_label_names(model: Any) -> dict[int, str]:
    candidate: dict[int, str] | None = None
    if LABEL_MAPPING_PATH.exists():
        try:
            candidate = _mapping_from_obj(json.loads(LABEL_MAPPING_PATH.read_text(encoding="utf-8")))
        except (OSError, json.JSONDecodeError) as exc:
            raise RuntimeError(f"Gagal membaca label mapping: {exc}") from exc

    if not candidate:
        config_map = getattr(model.config, "id2label", None)
        if isinstance(config_map, dict):
            try:
                candidate = {int(k): str(v) for k, v in config_map.items()}
            except (ValueError, TypeError):
                candidate = None

    if not candidate:
        raise RuntimeError(
            "Mapping label tidak ditemukan. Salin label_mapping.json dari pmb_indobert_output ke folder backend."
        )

    result: dict[int, str] = {}
    for index, label in candidate.items():
        canonical = _canonical_label(label)
        if canonical:
            result[index] = canonical

    expected_ids = set(range(int(model.config.num_labels)))
    if not expected_ids.issubset(result.keys()):
        raise RuntimeError(
            "Label mapping belum cocok dengan semua kelas model. Periksa backend/label_mapping.json; "
            "API sengaja berhenti daripada menebak arti label."
        )
    return result


def _load_model() -> None:
    global _model, _tokenizer, _id_to_canonical_label, _device, _model_error
    if not MODEL_DIR.is_dir():
        raise RuntimeError(
            f"Folder model tidak ditemukan: {MODEL_DIR}. Salin isi folder model_final_pmb ke lokasi ini "
            "atau set MODEL_DIR ke lokasi folder model yang benar."
        )
    required_files = ("config.json", "model.safetensors")
    missing = [name for name in required_files if not (MODEL_DIR / name).exists()]
    if missing:
        raise RuntimeError(f"Berkas model tidak lengkap di {MODEL_DIR}: {', '.join(missing)}")

    _device = "cuda" if torch.cuda.is_available() else "cpu"
    _tokenizer = AutoTokenizer.from_pretrained(str(MODEL_DIR), local_files_only=True)
    _model = AutoModelForSequenceClassification.from_pretrained(str(MODEL_DIR), local_files_only=True)
    _model.to(_device)
    _model.eval()
    _id_to_canonical_label = _load_label_names(_model)
    _model_error = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        _load_model()
    except Exception as exc:
        # Start the API even if model config is wrong; /health explains the blocker.
        global _model_error
        _model_error = str(exc)
    yield


app = FastAPI(
    title="AMIKOM PMB INSIGHT — IndoBERT API",
    version="0.1.0",
    description="Endpoint inferensi untuk checkpoint IndoBERT fine-tuned PMB. Tidak menyimpan komentar ke database.",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


def _verify_firebase_user(authorization: str | None = Header(default=None)) -> dict[str, Any] | None:
    """Verify Firebase Auth ID tokens without requiring a service-account key file.

    For protected inference requests, configure REQUIRE_AUTH=true and provide
    FIREBASE_ADMIN_EMAILS as a comma-separated allowlist of admin emails.
    """
    if not REQUIRE_AUTH:
        return None
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=401, detail="Firebase ID token dibutuhkan.")
    token = authorization.split(" ", 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Firebase ID token kosong.")
    if not FIREBASE_ADMIN_EMAILS:
        raise HTTPException(
            status_code=503,
            detail="Backend belum dikonfigurasi. Isi FIREBASE_ADMIN_EMAILS dengan email admin Firebase.",
        )

    try:
        import jwt
        from jwt import PyJWKClient

        global _FIREBASE_JWK_CLIENT
        if _FIREBASE_JWK_CLIENT is None:
            _FIREBASE_JWK_CLIENT = PyJWKClient(_FIREBASE_JWK_URL, cache_jwk_set=True, lifespan=3600)
        signing_key = _FIREBASE_JWK_CLIENT.get_signing_key_from_jwt(token)
        decoded = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=FIREBASE_PROJECT_ID,
            issuer=f"https://securetoken.google.com/{FIREBASE_PROJECT_ID}",
            options={"require": ["exp", "iat", "aud", "iss", "sub"]},
        )
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Firebase ID token tidak valid atau sudah kedaluwarsa.") from exc

    uid = decoded.get("sub")
    email = str(decoded.get("email") or "").strip().lower()
    if not uid or len(uid) > 128:
        raise HTTPException(status_code=401, detail="Token tidak memiliki UID Firebase yang valid.")
    if not email:
        raise HTTPException(status_code=403, detail="Akun Firebase harus memiliki email.")
    if email not in FIREBASE_ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Akun ini tidak diizinkan menggunakan layanan prediksi.")
    return decoded


def _predict_many(texts: list[str]) -> list[dict[str, Any]]:
    if _model is None or _tokenizer is None:
        detail = _model_error or "Model belum berhasil dimuat."
        raise HTTPException(status_code=503, detail=detail)
    cleaned = [text.strip() for text in texts]
    if any(not item for item in cleaned):
        raise HTTPException(status_code=422, detail="Teks komentar tidak boleh kosong.")
    encoded = _tokenizer(
        cleaned,
        padding=True,
        truncation=True,
        max_length=MAX_LENGTH,
        return_tensors="pt",
    )
    encoded = {key: value.to(_device) for key, value in encoded.items()}
    with torch.inference_mode():
        logits = _model(**encoded).logits
        probabilities = torch.softmax(logits, dim=-1).detach().cpu()

    results = []
    for text, probs in zip(cleaned, probabilities):
        label_id = int(torch.argmax(probs).item())
        probability_by_label = {
            _id_to_canonical_label[idx]: round(float(probs[idx].item()), 6)
            for idx in sorted(_id_to_canonical_label)
        }
        results.append({
            "text": text,
            "prediction": _id_to_canonical_label[label_id],
            "prediction_label": _id_to_canonical_label[label_id],
            "label_id": label_id,
            "confidence": round(float(probs[label_id].item()), 6),
            "probabilities": probability_by_label,
            "model": "model_final_pmb",
            "review_recommended": True,
        })
    return results


@app.get("/")
def root():
    return {"service": "AMIKOM PMB INSIGHT IndoBERT API", "docs": "/docs", "health": "/health"}


@app.get("/health")
def health():
    return {
        "status": "ok" if _model is not None else "model_not_ready",
        "model_loaded": _model is not None,
        "model_dir_exists": MODEL_DIR.is_dir(),
        "model_dir_name": MODEL_DIR.name,
        "device": _device,
        "require_auth": REQUIRE_AUTH,
        "error": _model_error,
    }


@app.post("/predict", dependencies=[Depends(_verify_firebase_user)])
def predict(request: PredictRequest):
    return _predict_many([request.text])[0]


@app.post("/predict/batch", dependencies=[Depends(_verify_firebase_user)])
def predict_batch(request: BatchPredictRequest):
    if any(len(text) > 10000 for text in request.texts):
        raise HTTPException(status_code=422, detail="Setiap teks dibatasi 10.000 karakter.")
    return {"count": len(request.texts), "results": _predict_many(request.texts)}
