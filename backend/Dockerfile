FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1
WORKDIR /app

COPY requirements.txt ./requirements.txt
RUN pip install --upgrade pip && \
    pip install --index-url https://download.pytorch.org/whl/cpu torch && \
    pip install -r requirements.txt

COPY main.py ./main.py
COPY label_mapping.json ./label_mapping.json
COPY model_final_pmb ./model_final_pmb

ENV MODEL_DIR=/app/model_final_pmb \
    LABEL_MAPPING_PATH=/app/label_mapping.json \
    MAX_LENGTH=256 \
    REQUIRE_AUTH=true \
    FIREBASE_PROJECT_ID=amikom-pmb-insight

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
