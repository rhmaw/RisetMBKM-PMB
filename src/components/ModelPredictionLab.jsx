import { useEffect, useMemo, useState } from "react";
import { Activity, AlertCircle, CheckCircle2, FlaskConical, LoaderCircle, RotateCcw, Send, ShieldAlert, Wifi, WifiOff } from "lucide-react";
import "./ModelPredictionLab.css";
import { auth } from "../firebase.js";

const API_BASE = String(
  import.meta.env.VITE_SENTIMENT_API_URL || "http://127.0.0.1:8765"
).replace(/\/+$/, "");

const EXAMPLES = [
  {
    label: "Contoh bernada positif",
    text: "Informasi pendaftaran sangat jelas dan membantu calon mahasiswa.",
  },
  {
    label: "Contoh informasi netral",
    text: "Pendaftaran mahasiswa baru tahun akademik 2026/2027 dilakukan melalui website resmi.",
  },
  {
    label: "Contoh keluhan",
    text: "Saya kesulitan mencari informasi biaya kuliah dan pertanyaan saya belum dijawab.",
  },
];

const LABELS = {
  Positive: "Positif",
  Neutral: "Netral",
  Negative: "Negatif",
};

export default function ModelPredictionLab() {
  // Show locally in development. In production, show only when an API URL is explicitly configured.
  if (!import.meta.env.DEV && !import.meta.env.VITE_SENTIMENT_API_URL) return null;
  return <ModelPredictionLabLocal />;
}

function ModelPredictionLabLocal() {
  const [text, setText] = useState(EXAMPLES[0].text);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [apiState, setApiState] = useState("checking");
  const [apiMessage, setApiMessage] = useState("Memeriksa layanan model lokal…");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${API_BASE}/health`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(`Health check HTTP ${response.status}`);
        return response.json();
      })
      .then((health) => {
        if (health.model_loaded) {
          setApiState("online");
          setApiMessage(`Model ${health.model_dir_name || "IndoBERT"} siap (${health.device || "CPU"}).`);
        } else {
          setApiState("error");
          setApiMessage(health.error || "API aktif, tetapi model belum berhasil dimuat.");
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setApiState("offline");
        setApiMessage(`API lokal tidak terjangkau. Jalankan Uvicorn pada ${API_BASE}.`);
      });
    return () => controller.abort();
  }, []);

  const probabilities = useMemo(() => {
    const source = result?.probabilities || {};
    return ["Positive", "Neutral", "Negative"].map((key) => ({
      key,
      label: LABELS[key],
      value: Number(source[key] ?? source[LABELS[key]] ?? 0),
    }));
  }, [result]);

  async function handlePredict(event) {
    event.preventDefault();
    const cleanText = text.trim();
    if (!cleanText) {
      setError("Masukkan komentar terlebih dahulu.");
      return;
    }
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error("Sesi login Firebase tidak ditemukan. Silakan login ulang.");
      }
      const idToken = await user.getIdToken();
      const response = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({ text: cleanText }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = typeof payload.detail === "string" ? payload.detail : `Permintaan gagal (HTTP ${response.status}).`;
        throw new Error(detail);
      }
      setResult(payload);
      setApiState("online");
      setApiMessage(`Terhubung ke ${payload.model || "model IndoBERT"}.`);
    } catch (err) {
      setError(err.message || "Prediksi gagal. Periksa API lokal dan terminal Uvicorn.");
      setApiState("offline");
    } finally {
      setBusy(false);
    }
  }

  function resetResult() {
    setResult(null);
    setError("");
  }

  const displayLabel = result ? (LABELS[result.prediction_label || result.prediction] || result.prediction_label || result.prediction || "Tidak diketahui") : "";
  const resultClass = result ? String(result.prediction_label || result.prediction || "unknown").toLowerCase() : "";
  const confidence = Number(result?.confidence || 0);

  return (
    <section className="panel model-lab" aria-labelledby="model-lab-title">
      <div className="model-lab-heading">
        <div className="model-lab-icon"><FlaskConical size={18} /></div>
        <div className="model-lab-title-copy">
          <div className="eyebrow">UJI LOKAL · HANYA PENGEMBANGAN</div>
          <h3 id="model-lab-title">Uji prediksi IndoBERT</h3>
          <p>Uji satu komentar dengan model yang sedang berjalan di laptop. Hasil tidak disimpan ke dataset atau Firestore.</p>
        </div>
        <span className={`model-api-state ${apiState}`}>
          {apiState === "online" ? <Wifi size={14} /> : apiState === "checking" ? <LoaderCircle className="spin" size={14} /> : <WifiOff size={14} />}
          {apiState === "online" ? "Model tersedia" : apiState === "checking" ? "Memeriksa" : "API tidak siap"}
        </span>
      </div>

      <div className="model-api-message" role="status">{apiMessage}</div>

      <div className="model-lab-grid">
        <form className="model-lab-form" onSubmit={handlePredict}>
          <label className="field" htmlFor="model-comment-text">
            <span>Komentar yang ingin diuji</span>
            <textarea
              id="model-comment-text"
              value={text}
              onChange={(event) => { setText(event.target.value); if (error) setError(""); }}
              maxLength={10000}
              rows={5}
              placeholder="Tempel komentar calon mahasiswa di sini…"
              disabled={busy}
            />
          </label>
          <div className="model-lab-text-meta">{text.length.toLocaleString("id-ID")} / 10.000 karakter</div>
          <div className="model-example-list">
            <span>Contoh untuk pengujian</span>
            <div>
              {EXAMPLES.map((example) => (
                <button
                  key={example.label}
                  className="btn btn-light btn-small"
                  type="button"
                  disabled={busy}
                  onClick={() => { setText(example.text); setError(""); setResult(null); }}
                >
                  {example.label}
                </button>
              ))}
            </div>
          </div>
          {error && <div className="notice error model-lab-error" role="alert"><AlertCircle size={16} /> <span>{error}</span></div>}
          <div className="model-lab-actions">
            <button className="btn btn-primary" type="submit" disabled={busy || !text.trim()}>
              {busy ? <LoaderCircle className="spin" size={16} /> : <Send size={15} />}
              {busy ? "Menganalisis…" : "Analisis komentar"}
            </button>
            <button className="btn btn-light" type="button" onClick={resetResult} disabled={busy || !result}>
              <RotateCcw size={14} /> Bersihkan hasil
            </button>
          </div>
        </form>

        <div className="model-result-panel" aria-live="polite">
          {!result && !error && (
            <div className="model-result-empty">
              <div><Activity size={22} /></div>
              <strong>Hasil prediksi akan muncul di sini</strong>
              <p>Masukkan komentar, lalu pilih Analisis komentar. Model akan mengembalikan label dan probabilitas tiap kelas.</p>
            </div>
          )}
          {result && (
            <div className="model-result-content">
              <div className="model-result-topline">
                <span>Prediksi model</span>
                <span className={`sentiment-pill ${resultClass}`}>{displayLabel}</span>
              </div>
              <div className="model-confidence-number">{(confidence * 100).toFixed(2)}<span>%</span></div>
              <div className="model-confidence-caption">Confidence untuk label terpilih · bukan ukuran akurasi model</div>

              <div className="model-probability-list">
                {probabilities.map((item) => (
                  <div className="model-probability-row" key={item.key}>
                    <div className="model-probability-heading"><span>{item.label}</span><strong>{(item.value * 100).toFixed(2)}%</strong></div>
                    <div className={`model-probability-track ${item.key.toLowerCase()}`}>
                      <span style={{ width: `${Math.max(0, Math.min(1, item.value)) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="model-result-meta">
                <span>Checkpoint</span><strong>{result.model || "model_final_pmb"}</strong>
                <span>ID label</span><strong>{result.label_id ?? "—"}</strong>
              </div>
              {result.review_recommended && (
                <div className="model-human-review"><ShieldAlert size={16} /><span>API menandai hasil ini untuk tinjauan manusia. Periksa konteks komentar sebelum mengambil keputusan.</span></div>
              )}
              <div className="model-local-only"><CheckCircle2 size={15} /> Prediksi ini hanya untuk pengujian; tidak mengubah label data tersimpan.</div>
            </div>
          )}
        </div>
      </div>
      <div className="model-lab-footnote">Permintaan prediksi mengirim Firebase ID token. Tetapkan FIREBASE_ADMIN_EMAILS pada backend dan gunakan HTTPS sebelum mengaktifkan API untuk website publik.</div>
    </section>
  );
}
