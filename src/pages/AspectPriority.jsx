import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  BrainCircuit,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  ClipboardList,
  Clock3,
  Filter,
  Gauge,
  Info,
  Layers3,
  Lightbulb,
  ListFilter,
  MessageSquareText,
  RefreshCw,
  Target,
  X,
  Zap,
} from "lucide-react";
import { aspectDemoExtraction, aspectDemoRows } from "../data/aspectPriorityDemoData.js";
import "./AspectPriority.css";

const numberFormat = new Intl.NumberFormat("id-ID");
const decimalFormat = (value) => Number(value).toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const percent = (value) => `${decimalFormat(value)}%`;

function statusClass(status) {
  if (status === "Prioritas Tinggi") return "high";
  if (status === "Prioritas Menengah") return "medium";
  if (status === "Baik") return "good";
  return "watch";
}

function downloadCsv(rows) {
  const columns = [
    ["aspek", "Aspek Layanan"], ["total", "Total Komentar"], ["positive", "Positif"],
    ["neutral", "Netral"], ["negative", "Negatif"], ["negativeRate", "Persentase Negatif"],
    ["priorityScore", "Skor Prioritas"], ["status", "Status Tindakan"], ["source", "Sumber Contoh"],
  ];
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [columns.map(([, label]) => escape(label)).join(","), ...rows.map((row) => columns.map(([key]) => escape(row[key])).join(","))].join("\r\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "aspect-priority-data-contoh.csv";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function AspectPriority() {
  const [period, setPeriod] = useState("2026/2027");
  const [source, setSource] = useState("all");
  const [aspect, setAspect] = useState("all");
  const [range, setRange] = useState("6m");
  const [appliedFilters, setAppliedFilters] = useState({ period: "2026/2027", source: "all", aspect: "all", range: "6m" });
  const [selected, setSelected] = useState(aspectDemoRows[0]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");

  const filteredRows = useMemo(() => aspectDemoRows.filter((row) =>
    (appliedFilters.period === "all" || row.period === appliedFilters.period)
    && (appliedFilters.source === "all" || row.source === appliedFilters.source)
    && (appliedFilters.aspect === "all" || row.id === appliedFilters.aspect),
  ), [appliedFilters]);
  const summary = useMemo(() => {
    const byNegative = [...filteredRows].sort((a, b) => b.negativeRate - a.negativeRate)[0] ?? null;
    const byPriority = [...filteredRows].sort((a, b) => b.priorityScore - a.priorityScore)[0] ?? null;
    return {
      aspectCount: filteredRows.length,
      commentCount: filteredRows.reduce((sum, row) => sum + row.total, 0),
      negativeLeader: byNegative,
      priorityLeader: byPriority,
    };
  }, [filteredRows]);

  useEffect(() => {
    if (filteredRows.length && !filteredRows.some((row) => row.id === selected?.id)) {
      setSelected(filteredRows[0]);
    }
  }, [filteredRows, selected?.id]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(""), 3600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        setModal(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const applyFilters = () => {
    setAppliedFilters({ period, source, aspect, range });
    setToast("Filter diterapkan. Rentang waktu akan aktif setelah data bertanggal terhubung.");
  };
  const resetFilters = () => {
    setPeriod("2026/2027");
    setSource("all");
    setAspect("all");
    setRange("6m");
    setAppliedFilters({ period: "2026/2027", source: "all", aspect: "all", range: "6m" });
    setToast("Filter dikembalikan ke pengaturan awal.");
  };
  const openDetail = (row) => {
    setSelected(row);
    setDrawerOpen(true);
  };
  const beginTicket = () => {
    setDrawerOpen(false);
    setModal("ticket");
  };

  return (
    <div className="page-stack ap-root">
      <div className="page-intro ap-page-intro">
        <div>
          <div className="eyebrow">ANALISIS LANJUTAN / PROTOTIPE</div>
          <div className="ap-title-line">
            <h2>Analisis Aspek &amp; Prioritas Layanan</h2>
            <span className="ap-demo-badge"><CircleAlert size={13} /> DATA CONTOH</span>
          </div>
          <p>Identifikasi aspek layanan PMB, sentimen per aspek, dan prioritas perbaikan berbasis komentar calon mahasiswa.</p>
        </div>
        <div className="ap-engine-chip"><BrainCircuit size={16} /><span>Model analisis aspek · belum terhubung</span></div>
      </div>

      <div className="ap-demo-notice" role="note">
        <Info size={17} />
        <div><strong>Halaman prototipe untuk handoff tim.</strong> Seluruh angka, titik matriks, contoh ekstraksi, skor prioritas, akar keluhan, dan rekomendasi di halaman ini adalah <b>data dummy dari desain</b>, bukan keluaran model atau data operasional. Dataset, model ABSA, metrik evaluasi, dan logika prioritas belum dihubungkan.</div>
      </div>

      <section className="ap-filter-panel">
        <div className="ap-filter-fields">
          <label className="ap-filter-control"><span><CalendarDays size={14} /> Periode PMB</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option value="2026/2027">Periode: 2026/2027</option><option value="2025/2026">Periode: 2025/2026</option><option value="all">Semua periode</option></select></label>
          <label className="ap-filter-control"><span><Layers3 size={14} /> Sumber</span><select value={source} onChange={(event) => setSource(event.target.value)}><option value="all">Semua sumber</option><option>Instagram Resmi PMB</option><option>WhatsApp Hotline PMB</option><option>Survei Form Pendaftaran</option><option>Google Maps Review</option></select></label>
          <label className="ap-filter-control"><span><Target size={14} /> Aspek layanan</span><select value={aspect} onChange={(event) => setAspect(event.target.value)}><option value="all">Semua aspek</option>{aspectDemoRows.map((row) => <option key={row.id} value={row.id}>{row.aspect}</option>)}</select></label>
          <label className="ap-filter-control ap-filter-control-disabled"><span><Clock3 size={14} /> Rentang waktu</span><select value="pending" disabled aria-describedby="ap-range-help"><option value="pending">Menunggu data bertanggal</option></select><small id="ap-range-help">Aktif setelah sumber data dihubungkan.</small></label>
        </div>
        <div className="ap-filter-actions"><button className="btn btn-primary" onClick={applyFilters}><Filter size={15} /> Terapkan Filter</button><button className="btn btn-light" onClick={resetFilters}><RefreshCw size={14} /> Reset</button></div>
      </section>

      <section className="ap-stat-grid" aria-label="Ringkasan data ilustrasi">
        <article className="ap-stat-card"><div className="ap-stat-top"><span>Aspek ditampilkan</span><i className="purple"><Layers3 size={19} /></i></div><strong>{summary.aspectCount.toLocaleString("id-ID")}</strong><small>Aspek dalam filter saat ini</small></article>
        <article className="ap-stat-card"><div className="ap-stat-top"><span>Total pembahasan</span><i className="violet"><MessageSquareText size={19} /></i></div><strong>{numberFormat.format(summary.commentCount)}</strong><small>Hitungan per aspek; satu komentar dapat muncul di beberapa aspek</small></article>
        <article className="ap-stat-card"><div className="ap-stat-top"><span>Proporsi negatif tertinggi</span><i className="red"><AlertTriangle size={19} /></i></div><strong className="ap-red-value">{summary.negativeLeader ? percent(summary.negativeLeader.negativeRate) : "—"}</strong><small>{summary.negativeLeader ? summary.negativeLeader.aspect : "Tidak ada aspek untuk filter ini"}</small></article>
        <article className="ap-stat-card"><div className="ap-stat-top"><span>Skor prioritas tertinggi</span><i className="orange"><Zap size={19} /></i></div><strong className="ap-orange-value">{summary.priorityLeader ? `${decimalFormat(summary.priorityLeader.priorityScore)} / 100` : "—"}</strong><small>{summary.priorityLeader ? summary.priorityLeader.aspect : "Menunggu data"} · skor ilustrasi</small></article>
      </section>

      <div className="ap-main-grid">
        <section className="panel ap-matrix-panel">
          <div className="ap-panel-heading"><div><div className="ap-panel-title-line"><h3>Matriks Prioritas Perbaikan Layanan</h3><span className="ap-method-badge">Visual mockup</span></div><p>Pemetaan ilustratif berdasarkan frekuensi pembahasan dan proporsi sentimen negatif.</p></div><div className="ap-matrix-legend"><span><i className="high-dot" /> Prioritas tinggi</span><span><i className="medium-dot" /> Menengah</span><span><i className="good-dot" /> Monitoring / baik</span></div></div>
          <div className="ap-matrix-shell">
            <div className="ap-y-axis-title">Proporsi sentimen negatif (%)</div>
            <div className="ap-matrix-y-ticks"><span>50%</span><span>25%</span><span>0%</span></div>
            <div className="ap-matrix-plot">
              <div className="ap-quadrants">
                <div className="ap-quadrant ap-q2"><strong>KUADRAN II</strong><b>PRIORITAS MENENGAH</b><small>Frekuensi sedang · keluhan signifikan</small></div>
                <div className="ap-quadrant ap-q1"><strong>KUADRAN I</strong><b>PRIORITAS UTAMA</b><small>Frekuensi tinggi · keluhan tinggi</small></div>
                <div className="ap-quadrant ap-q4"><strong>KUADRAN IV</strong><b>MONITORING</b><small>Frekuensi rendah · keluhan rendah</small></div>
                <div className="ap-quadrant ap-q3"><strong>KUADRAN III</strong><b>PERTAHANKAN KUALITAS</b><small>Sentimen positif dominan</small></div>
              </div>
              <div className="ap-matrix-cross ap-cross-x" /><div className="ap-matrix-cross ap-cross-y" />
              {filteredRows.map((row) => <button type="button" key={row.id} className={`ap-point ${statusClass(row.status)} ${row.frequencyX >= 70 ? "edge-right" : ""} ${selected.id === row.id ? "selected" : ""}`} style={{ left: `${row.frequencyX}%`, top: `${row.negativeY}%` }} onClick={() => openDetail(row)} aria-label={`Lihat contoh aspek ${row.aspect}`} title={`${row.aspect}: ${numberFormat.format(row.total)} komentar, ${percent(row.negativeRate)} negatif`}><span className="ap-point-core" /><span className="ap-point-label"><b>{row.shortName}</b><small>{numberFormat.format(row.total)} · {percent(row.negativeRate)}</small></span></button>)}
            </div>
            <div className="ap-matrix-x-ticks"><span>0</span><span>1.000</span><span>2.000</span><span>3.000</span><span>4.000 komentar</span></div>
            <div className="ap-x-axis-title">Frekuensi pembahasan (jumlah komentar terindeks)</div>
          </div>
          <div className="ap-insight-callout"><Lightbulb size={19} /><div><strong>Catatan dari data ilustrasi</strong><p>{summary.priorityLeader ? `${summary.priorityLeader.aspect} memiliki skor prioritas contoh tertinggi (${decimalFormat(summary.priorityLeader.priorityScore)}).` : "Tidak ada aspek untuk ditampilkan dengan filter saat ini."} Nilai ini hanya untuk menguji tampilan; bukan rekomendasi operasional. Skor final harus dihitung dari output model yang sudah dievaluasi.</p></div></div>
        </section>

        <aside className="ap-extraction-column">
          <section className="panel ap-extraction-panel">
            <div className="ap-extraction-heading"><div className="ap-icon-heading"><BrainCircuit size={19} /><h3>Contoh pemetaan aspek &amp; sentimen</h3></div><span>UI CONTOH</span></div>
            <p className="ap-subtle-copy">Satu komentar dapat membahas beberapa aspek dengan sentimen berbeda. Bagian ini disiapkan sebagai tempat menampilkan output ekstraksi model.</p>
            <div className="ap-raw-comment"><span>KOMENTAR ASLI · CONTOH</span><blockquote>“{aspectDemoExtraction.rawComment}”</blockquote><small><MessageSquareText size={13} /> {aspectDemoExtraction.source} · {aspectDemoExtraction.date}</small></div>
            <div className="ap-section-label">Temuan dari komentar (contoh)</div>
            <div className="ap-extracted-list">{aspectDemoExtraction.aspects.map((item, index) => <article className={`ap-extracted-card ${item.sentiment === "Negatif" ? "negative" : "positive"}`} key={item.name}><div className="ap-extracted-top"><strong>Aspek {index + 1}: {item.name}</strong><span>{item.sentiment}</span></div><p>Potongan komentar yang terdeteksi: “{item.entity}”</p><div className="ap-confidence-row"><span>Tingkat keyakinan (contoh)</span><b>{item.confidence.toLocaleString("id-ID", { style: "percent", maximumFractionDigits: 0 })}</b></div><div className="ap-confidence-track"><i style={{ width: `${item.confidence * 100}%` }} /></div></article>)}</div>
            <div className="ap-model-status"><div><span>Kesiapan model</span><strong>Belum terhubung</strong></div><span className="ap-pending-chip"><Clock3 size={12} /> Belum terhubung</span></div>
          </section>
          <section className="panel ap-evaluation-card"><div className="ap-eval-icon"><Gauge size={21} /></div><div><span>Evaluasi model</span><strong>Belum tersedia</strong><small>Ukuran kualitas model (precision, recall, F1) akan ditampilkan setelah integrasi.</small></div><button className="btn btn-light btn-small" onClick={() => setModal("model")}><Activity size={13} /> Detail</button></section>
        </aside>
      </div>

      <section className="panel ap-table-panel">
        <div className="ap-table-heading"><div><div className="ap-panel-title-line"><h3>Sentimen Berdasarkan Aspek Layanan</h3><span className="ap-snapshot-badge">Agregat data contoh</span></div><p>Angka agregat, persentase negatif, dan skor prioritas pada tabel berikut merupakan placeholder UI.</p></div><div className="ap-table-actions"><span className="ap-row-count">{filteredRows.length} / {aspectDemoRows.length} aspek</span><button className="btn btn-light" onClick={() => downloadCsv(filteredRows)}><ArrowDownToLine size={15} /> Unduh CSV contoh</button></div></div>
        {(appliedFilters.source !== "all" || appliedFilters.aspect !== "all" || appliedFilters.period !== "2026/2027") && <div className="ap-active-filter"><ListFilter size={13} /> Filter aktif · Periode: {appliedFilters.period === "all" ? "Semua" : appliedFilters.period} · Sumber: {appliedFilters.source === "all" ? "Semua" : appliedFilters.source} · Aspek: {appliedFilters.aspect === "all" ? "Semua" : (aspectDemoRows.find((row) => row.id === appliedFilters.aspect)?.aspect ?? "Tidak diketahui")}</div>}
        <div className="ap-table-scroll"><table className="ap-data-table"><thead><tr><th>Aspek Layanan</th><th>Total komentar</th><th>Positif</th><th>Netral</th><th>Negatif</th><th>% negatif</th><th>Skor prioritas</th><th>Status tindakan</th><th>Aksi</th></tr></thead><tbody>{filteredRows.length ? filteredRows.map((row) => <tr key={row.id} className={row.status === "Prioritas Tinggi" ? "is-high-priority" : ""}><td><div className="ap-aspect-name"><i className={statusClass(row.status)} />{row.aspect}</div></td><td className="ap-num">{numberFormat.format(row.total)}</td><td className="ap-num ap-positive-num">{numberFormat.format(row.positive)}</td><td className="ap-num">{numberFormat.format(row.neutral)}</td><td className="ap-num ap-negative-num">{numberFormat.format(row.negative)}</td><td className="ap-num"><strong className={row.negativeRate >= 25 ? "ap-negative-num" : ""}>{percent(row.negativeRate)}</strong></td><td className={`ap-num ap-priority-score ${statusClass(row.status)}`}>{decimalFormat(row.priorityScore)}</td><td><span className={`ap-status-pill ${statusClass(row.status)}`}>{row.status}</span></td><td><button className="ap-detail-button" onClick={() => openDetail(row)}>Detail <ChevronRight size={13} /></button></td></tr>) : <tr><td colSpan="9" className="ap-empty-row"><CircleAlert size={19} /><strong>Tidak ada aspek untuk filter ini.</strong><span>Ubah periode atau reset filter. Data masih berupa contoh.</span></td></tr>}</tbody></table></div>
        <div className="ap-table-footer"><span>Menampilkan {filteredRows.length} dari {aspectDemoRows.length} aspek ilustrasi · belum terhubung ke backend</span><span><i /> Semua nilai masih contoh.</span></div>
      </section>

      {drawerOpen && selected && <><button className="ap-drawer-backdrop" onClick={() => setDrawerOpen(false)} aria-label="Tutup detail aspek" /><aside className="ap-drawer" aria-label={`Detail ${selected.aspect}`}><div className="ap-drawer-head"><div><span>DETAIL ASPEK LAYANAN · CONTOH</span><h3>{selected.aspect}</h3></div><button className="ap-icon-button" onClick={() => setDrawerOpen(false)} aria-label="Tutup"><X size={20} /></button></div><div className="ap-drawer-scroll"><div className={`ap-urgency-box ${statusClass(selected.status)}`}><div><span>Status contoh</span><strong>{selected.urgency}</strong></div><div><span>Skor dummy</span><strong>{decimalFormat(selected.priorityScore)} / 100</strong></div></div><div className="ap-detail-metrics"><div><span>Positif</span><strong className="ap-positive-num">{percent((selected.positive / selected.total) * 100)}</strong><small>{numberFormat.format(selected.positive)} komentar</small></div><div><span>Netral</span><strong>{percent((selected.neutral / selected.total) * 100)}</strong><small>{numberFormat.format(selected.neutral)} komentar</small></div><div><span>Negatif</span><strong className="ap-negative-num">{percent(selected.negativeRate)}</strong><small>{numberFormat.format(selected.negative)} komentar</small></div></div><div className="ap-detail-section"><div className="ap-detail-section-title"><Activity size={15} /><h4>Ringkasan aspek</h4></div><div className="ap-detail-facts"><div><span>Total komentar contoh</span><strong>{numberFormat.format(selected.total)}</strong></div><div><span>Sumber contoh</span><strong>{selected.source}</strong></div><div><span>Periode mockup</span><strong>{selected.period}</strong></div><div><span>Status implementasi</span><strong>Belum terhubung</strong></div></div></div><div className="ap-detail-section"><div className="ap-detail-section-title"><ClipboardList size={15} /><h4>Klaster keluhan contoh</h4></div><div className="ap-root-causes">{selected.rootCauses.map((cause, index) => <div key={cause.title}><span>{index + 1}. {cause.title}</span><strong>{numberFormat.format(cause.count)}</strong></div>)}</div></div><div className="ap-detail-recommendation"><div className="ap-detail-section-title"><Lightbulb size={15} /><h4>Rekomendasi contoh</h4></div><p>{selected.recommendation}</p></div><div className="ap-detail-disclaimer"><Info size={15} /> Isi panel ini adalah contoh tampilan. Tim perlu mengganti seluruh metrik, akar keluhan, dan rekomendasi dengan output model serta data tervalidasi.</div></div><div className="ap-drawer-actions"><button className="btn btn-light" onClick={() => setDrawerOpen(false)}>Tutup</button><button className="btn btn-primary" onClick={beginTicket}><ClipboardList size={15} /> Buat tiket (prototype)</button></div></aside></>}

      {modal && <div className="ap-modal-backdrop" role="presentation" onClick={() => setModal(null)}><section className="ap-modal" role="dialog" aria-modal="true" aria-labelledby="ap-modal-title" onClick={(event) => event.stopPropagation()}><div className="ap-modal-head"><div className="ap-modal-icon">{modal === "ticket" ? <ClipboardList size={21} /> : <BrainCircuit size={21} />}</div><button className="ap-icon-button" onClick={() => setModal(null)} aria-label="Tutup"><X size={18} /></button></div>{modal === "model" ? <><div className="eyebrow">MODEL HANDOFF</div><h3 id="ap-modal-title">Status integrasi ABSA</h3><p className="ap-modal-copy">Panel ini adalah checklist integrasi untuk anggota tim yang mengerjakan data dan model. Belum ada hasil evaluasi model yang terhubung.</p><div className="ap-model-checklist"><div><Clock3 size={16} /><span>Dataset anotasi aspek</span><b>Menunggu</b></div><div><Clock3 size={16} /><span>Ekstraksi aspek / entity</span><b>Menunggu</b></div><div><Clock3 size={16} /><span>Klasifikasi sentimen per aspek</span><b>Menunggu</b></div><div><Clock3 size={16} /><span>Formula skor prioritas</span><b>Menunggu</b></div><div><Clock3 size={16} /><span>Evaluasi precision / recall / F1</span><b>Menunggu</b></div></div></> : <><div className="eyebrow">PROTOTIPE TINDAKAN</div><h3 id="ap-modal-title">Tiket intervensi belum aktif</h3><p className="ap-modal-copy">Tampilan pembuatan tiket sudah disediakan untuk alur UI, tetapi data tidak dikirim atau disimpan. Integrasi backend dan persetujuan pengelola perlu dibuat kemudian.</p><div className="ap-ticket-preview"><span>Aspek yang dipilih</span><strong>{selected?.aspect ?? "—"}</strong><span>Status rancangan</span><strong>Belum tersambung ke sistem tiket</strong></div></>}<div className="ap-modal-actions"><button className="btn btn-primary" onClick={() => setModal(null)}><Check size={15} /> Mengerti</button></div></section></div>}
      {toast && <div className="ap-toast" role="status"><CircleCheck size={16} /> {toast}</div>}
    </div>
  );
}
