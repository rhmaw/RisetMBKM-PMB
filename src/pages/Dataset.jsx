import { Database, Download, FileUp, Info, RefreshCw, ShieldCheck, CloudUpload } from "lucide-react";
import { useRef, useState } from "react";
import { useDataset } from "../context/DatasetContext.jsx";

export default function Dataset() {
  const {
    rows,
    ready,
    sourceName,
    importCsvFile,
    exportCsv,
    cloudState,
    syncToCloud,
    refreshFromCloud,
  } = useDataset();
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);
  const [syncBusy, setSyncBusy] = useState(false);
  const [refreshBusy, setRefreshBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const counts = rows.reduce((result, row) => {
    result[row.label] = (result[row.label] || 0) + 1;
    return result;
  }, { Positive: 0, Neutral: 0, Negative: 0 });

  async function load(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const result = await importCsvFile(file);
      setMessage(`Impor selesai: ${result.added} komentar baru ditambahkan, ${result.updated || 0} data lama diperbaiki, ${result.duplicates} duplikat dilewati. Total dataset: ${result.total}. Klik “Sinkronkan ke Firebase” untuk menyimpan gabungan data ke cloud.`);
    } catch (importError) {
      setError(`Gagal membaca CSV: ${importError.message}`);
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  async function sync() {
    setSyncBusy(true);
    setMessage("");
    setError("");
    try {
      const result = await syncToCloud();
      setMessage(`Sinkronisasi berhasil. ${result.total.toLocaleString("id-ID")} komentar sudah ditulis ke Firestore. Dataset lokal tetap dipertahankan.`);
    } catch (syncError) {
      console.error("Sinkronisasi Firestore gagal:", syncError);
      setError(`Sinkronisasi gagal: ${syncError.message}. Periksa koneksi, email admin di Security Rules, dan status login Firebase.`);
    } finally {
      setSyncBusy(false);
    }
  }

  async function refresh() {
    setRefreshBusy(true);
    setMessage("");
    setError("");
    try {
      const result = await refreshFromCloud();
      setMessage(`Pembaruan dari cloud selesai. Dataset gabungan berisi ${result.total.toLocaleString("id-ID")} komentar; ${result.cloudCount.toLocaleString("id-ID")} dokumen ditemukan di Firestore.`);
    } catch (refreshError) {
      setError(`Gagal mengambil data cloud: ${refreshError.message}. Periksa Security Rules dan akun admin.`);
    } finally {
      setRefreshBusy(false);
    }
  }

  const cloudTone = cloudState.status === "connected" ? "success" : cloudState.status === "error" ? "error" : "info";

  return (
    <div className="page-stack">
      <div className="page-intro">
        <div>
          <div className="eyebrow">SUMBER DATA</div>
          <h2>Dataset</h2>
          <p>Kelola komentar dari CSV dan sinkronkan dataset gabungan ke penyimpanan cloud.</p>
        </div>
        <div className="live-pill"><i />{ready ? "Dataset siap" : "Memuat…"}</div>
      </div>

      <div className="stat-grid">
        {[
          ["Total komentar", rows.length],
          ["Positif", counts.Positive],
          ["Netral", counts.Neutral],
          ["Negatif", counts.Negative],
        ].map(([label, value]) => (
          <div className="stat-card mini-stat" key={label}>
            <span className="stat-label">{label}</span>
            <strong className="stat-value">{Number(value).toLocaleString("id-ID")}</strong>
          </div>
        ))}
      </div>

      <section className="panel import-panel">
        <div className="import-icon"><FileUp size={25} /></div>
        <div className="import-copy">
          <h3>Impor file CSV</h3>
          <p>Format yang didukung antara lain <code>text_raw</code>/<code>Komentar</code>, <code>prediction_label</code>/<code>Label</code>, <code>confidence</code>, <code>source</code>, dan <code>date</code>.</p>
          <p className="muted-small">Impor CSV disimpan di browser terlebih dahulu. Klik sinkronisasi untuk menggabungkan dan mengirim dataset ke Firebase.</p>
        </div>
        <div className="import-actions">
          <input className="hidden-input" type="file" accept=".csv,text/csv" ref={ref} onChange={load} />
          <button className="btn btn-primary" disabled={busy} onClick={() => ref.current?.click()}>
            <FileUp size={16} />{busy ? "Mengimpor…" : "Pilih file CSV"}
          </button>
          <button className="btn btn-light" disabled={!rows.length} onClick={exportCsv}>
            <Download size={16} />Ekspor backup CSV
          </button>
        </div>
      </section>

      <section className={`notice ${cloudTone}`}>
        {cloudState.status === "connected" ? <ShieldCheck size={18} /> : cloudState.status === "error" ? <Info size={18} /> : <Database size={18} />}
        <div>
          <strong>Status Firebase</strong>
          <p>{cloudState.message}</p>
        </div>
      </section>

      <div className="import-actions cloud-actions">
        <button className="btn btn-primary" disabled={syncBusy || !ready || cloudState.status === "signed-out" || cloudState.status === "loading"} onClick={sync}>
          <CloudUpload size={16} />{syncBusy ? "Menyinkronkan…" : "Sinkronkan ke Firebase"}
        </button>
        <button className="btn btn-light" disabled={refreshBusy || cloudState.status === "signed-out" || cloudState.status === "loading"} onClick={refresh}>
          <RefreshCw size={16} />{refreshBusy ? "Memuat cloud…" : "Ambil data terbaru"}
        </button>
      </div>

      {message && <div className="notice success"><ShieldCheck size={18} /><div>{message}</div></div>}
      {error && <div className="notice error"><Info size={18} /><div>{error}</div></div>}

      <section className="panel">
        <div className="panel-heading">
          <div><h3>Informasi dataset aktif</h3><p>Ringkasan sumber dan status penyimpanan</p></div>
          <Database size={20} className="muted-icon" />
        </div>
        <div className="info-list">
          <div><span>Sumber data</span><strong>{sourceName}</strong></div>
          <div><span>Total data aktif</span><strong>{rows.length.toLocaleString("id-ID")} komentar</strong></div>
          <div><span>Mode impor</span><strong>Gabung + lewati duplikat</strong></div>
          <div><span>Penyimpanan lokal</span><strong>Cache browser aktif</strong></div>
          <div><span>Cloud Firestore</span><strong>{cloudState.status === "connected" ? `${cloudState.cloudCount.toLocaleString("id-ID")} dokumen terdeteksi` : cloudState.status === "error" ? "Perlu pemeriksaan konfigurasi" : "Status pemeriksaan"}</strong></div>
        </div>
      </section>

      <div className="notice info">
        <Info size={18} />
        <div><strong>Catatan keamanan dan migrasi</strong><p>Sinkronisasi pertama tidak menghapus dokumen cloud. Dataset lokal dipertahankan sebagai cache. Sebelum migrasi pertama, ekspor backup CSV dan pastikan email Firebase admin cocok dengan email yang diizinkan pada Firestore Rules.</p></div>
      </div>
    </div>
  );
}
