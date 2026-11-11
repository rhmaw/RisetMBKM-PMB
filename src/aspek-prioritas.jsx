import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import './aspek-prioritas.css';
import {
  ASPECTS, ASPECT_MAP, CRITERIA, CSV_TEMPLATE, DEFAULT_IMPORTANCE, DEFAULT_WEIGHTS, LEVELS,
  analyzeRows, parseTable, summarize, toCsv,
} from './aspek-engine';
import { SAMPLE_ROWS } from './sample-data';

const LS_KEY = 'pmb-aspek-prioritas-v1';
const LEVEL_CLASS = { [LEVELS.HIGH]: 'hi', [LEVELS.MID]: 'md', [LEVELS.LOW]: 'lo', [LEVELS.NONE]: 'na' };
const SENT_LABEL = { positif: 'Positif', netral: 'Netral', negatif: 'Negatif' };
const PMB_YEAR = 2026; // Periode PMB hanya untuk tahun ini
const DATE_MIN = `${PMB_YEAR}-01-01`;
const DATE_MAX = `${PMB_YEAR}-12-31`;
const forceYear = (v) => (v && v.slice(0, 4) !== String(PMB_YEAR) ? `${PMB_YEAR}${v.slice(4)}` : v);

const pct = (v) => `${Math.round(v * 100)}%`;

function loadSaved() {
  try {
    const s = JSON.parse(localStorage.getItem(LS_KEY));
    return s && typeof s === 'object' ? s : null;
  } catch { return null; }
}

function download(name, text, type = 'text/csv;charset=utf-8') {
  const blob = new Blob([`﻿${text}`], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------------- komponen kecil ---------------- */

function LevelBadge({ level }) {
  return <span className={`ap-badge ap-badge--${LEVEL_CLASS[level]}`}>{level}</span>;
}

function SentimentBar({ a }) {
  const t = a.mentions || 1;
  return (
    <div className="ap-sbar" role="img" aria-label={`Positif ${a.pos}, netral ${a.neu}, negatif ${a.neg}`}>
      <span className="ap-sbar__pos" style={{ width: `${(a.pos / t) * 100}%` }} />
      <span className="ap-sbar__neu" style={{ width: `${(a.neu / t) * 100}%` }} />
      <span className="ap-sbar__neg" style={{ width: `${(a.neg / t) * 100}%` }} />
    </div>
  );
}

function TrendCell({ trend }) {
  if (!trend.reliable) return <span className="ap-muted" title="Data per paruh waktu belum cukup (minimal 3 sebutan)">n/a</span>;
  const pts = Math.round(trend.delta * 100);
  if (Math.abs(pts) < 5) return <span className="ap-muted">→ stabil</span>;
  return pts > 0
    ? <span className="ap-trend ap-trend--up" title="Proporsi negatif naik">↑ +{pts} poin</span>
    : <span className="ap-trend ap-trend--down" title="Proporsi negatif turun">↓ {pts} poin</span>;
}

function PriorityMatrix({ aspects, onPick }) {
  const data = aspects.filter((a) => a.mentions > 0);
  const W = 640; const H = 360; const L = 54; const R = 18; const T = 18; const B = 46;
  const pw = W - L - R; const ph = H - T - B;
  const maxShare = Math.max(0.2, ...data.map((a) => a.share)) * 1.2;
  const x = (v) => L + (v / maxShare) * pw;
  const y = (v) => T + (1 - v) * ph;
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((k) => k * maxShare);
  return (
    <svg className="ap-matrix" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Matriks prioritas: sebutan terhadap proporsi negatif">
      <rect x={L} y={T} width={pw} height={ph} className="ap-matrix__bg" />
      <rect x={x(maxShare / 2)} y={T} width={pw / 2} height={ph / 2} className="ap-matrix__hot" />
      <line x1={x(maxShare / 2)} x2={x(maxShare / 2)} y1={T} y2={T + ph} className="ap-matrix__mid" />
      <line x1={L} x2={L + pw} y1={y(0.5)} y2={y(0.5)} className="ap-matrix__mid" />
      <text x={L + pw - 8} y={T + 16} textAnchor="end" className="ap-matrix__q ap-matrix__q--hot">Prioritas utama</text>
      <text x={L + 8} y={T + 16} className="ap-matrix__q">Pantau</text>
      <text x={L + pw - 8} y={T + ph - 8} textAnchor="end" className="ap-matrix__q">Pertahankan</text>
      <text x={L + 8} y={T + ph - 8} className="ap-matrix__q">Prioritas rendah</text>
      {[0, 0.25, 0.5, 0.75, 1].map((v) => (
        <g key={v}>
          <text x={L - 8} y={y(v) + 4} textAnchor="end" className="ap-matrix__tick">{pct(v)}</text>
        </g>
      ))}
      {xTicks.map((v) => (
        <text key={v} x={x(v)} y={T + ph + 18} textAnchor="middle" className="ap-matrix__tick">{pct(v)}</text>
      ))}
      <text x={L + pw / 2} y={H - 6} textAnchor="middle" className="ap-matrix__axis">Porsi komentar yang menyebut aspek</text>
      <text transform={`translate(14 ${T + ph / 2}) rotate(-90)`} textAnchor="middle" className="ap-matrix__axis">Proporsi negatif</text>
      {data.map((a) => {
        const cx = x(a.share); const cy = y(a.negRate); const r = 7 + (a.score / 100) * 12;
        const left = cx > W - 140;
        return (
          <g key={a.id} className={`ap-dot ap-dot--${LEVEL_CLASS[a.level]}`} tabIndex={0} role="button" onClick={() => onPick(a.id)} onKeyDown={(e) => { if (e.key === 'Enter') onPick(a.id); }}>
            <title>{`${a.label}: skor ${a.score}, ${a.mentions} sebutan, ${pct(a.negRate)} negatif`}</title>
            <circle cx={cx} cy={cy} r={r} />
            <text x={left ? cx - r - 4 : cx + r + 4} y={cy + 4} textAnchor={left ? 'end' : 'start'}>{a.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------- halaman utama ---------------- */

export default function AspekPrioritas({ predictor, predictorLabel }) {
  const saved = useRef(loadSaved()).current;
  const fileRef = useRef(null);

  const [rows, setRows] = useState([]);
  const [sourceName, setSourceName] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [weights, setWeights] = useState({ ...DEFAULT_WEIGHTS, ...(saved?.weights || {}) });
  const [importance, setImportance] = useState({ ...DEFAULT_IMPORTANCE, ...(saved?.importance || {}) });
  const [results, setResults] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sumber, setSumber] = useState('all');
  const [aspek, setAspek] = useState('all');
  const [applied, setApplied] = useState(null); // null = belum ada pengecekan, hasil dikosongkan
  const [expanded, setExpanded] = useState(null);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    let live = true;
    if (!rows.length) { setResults([]); setBusy(false); return () => { live = false; }; }
    setBusy(true);
    analyzeRows(rows, predictor).then((r) => { if (live) { setResults(r); setBusy(false); } });
    return () => { live = false; };
  }, [rows, predictor]);

  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({ weights, importance }));
    } catch { /* penyimpanan penuh/diblokir: abaikan */ }
  }, [weights, importance]);

  const sourceOptions = useMemo(() => [...new Set(results.map((r) => r.source).filter((s) => s && s !== '-'))].sort(), [results]);
  const loaded = rows.length > 0;
  const hasDates = results.some((r) => r.date);

  // Setiap data baru dimuat: semua filter kembali kosong.
  useEffect(() => { setDateFrom(''); setDateTo(''); setSumber('all'); setAspek('all'); setApplied(null); setExpanded(null); setQuery(''); }, [rows]);

  const onFrom = (v) => { const f = forceYear(v); setDateFrom(f); if (f && dateTo && f > dateTo) setDateTo(f); };
  const onTo = (v) => { const t = forceYear(v); setDateTo(t); if (t && dateFrom && t < dateFrom) setDateFrom(t); };

  const filtered = useMemo(() => {
    if (!applied) return [];
    let list = results;
    if (applied.from) list = list.filter((r) => r.date && r.date >= applied.from);
    if (applied.to) list = list.filter((r) => r.date && r.date <= applied.to);
    if (applied.sumber !== 'all') list = list.filter((r) => r.source === applied.sumber);
    return list;
  }, [results, applied]);
  const appliedAspek = applied ? applied.aspek : 'all';

  const applyFilters = () => { setApplied({ from: dateFrom, to: dateTo, sumber, aspek }); setExpanded(null); setLimit(10); };
  const resetFilters = () => { setDateFrom(''); setDateTo(''); setSumber('all'); setAspek('all'); setApplied(null); setExpanded(null); setQuery(''); };

  const summary = useMemo(() => summarize(filtered, { weights, importance }), [filtered, weights, importance]);
  const shown = useMemo(() => (appliedAspek === 'all' ? summary.aspects : summary.aspects.filter((a) => a.id === appliedAspek)), [summary, appliedAspek]);
  const active = summary.aspects.filter((a) => a.mentions > 0);
  const top = active[0];

  const extraction = useMemo(() => {
    const q = query.trim().toLowerCase();
    return filtered.filter((r) => r.aspects.length && (appliedAspek === 'all' || r.aspects.some((a) => a.aspect === appliedAspek)) && (!q || r.text.toLowerCase().includes(q)));
  }, [filtered, appliedAspek, query]);

  const recs = active.filter((a) => a.level === LEVELS.HIGH || a.level === LEVELS.MID).slice(0, 5);
  const wNorm = summary.weights;

  /* ---- aksi ---- */
  const onFile = (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const reader = new FileReader();
    reader.onerror = () => setNotice({ type: 'err', text: 'File tidak dapat dibaca.' });
    reader.onload = () => {
      const out = parseTable(String(reader.result));
      if (out.error || !out.rows.length) { setNotice({ type: 'err', text: out.error || 'Tidak ada komentar yang dapat dibaca.' }); return; }
      setRows(out.rows); setSourceName(f.name); setIsDemo(false); setLimit(10);
      setNotice({ type: 'ok', text: `${out.rows.length} komentar dimuat dari ${f.name}. ${(out.notes || []).join(' ')}` });
    };
    reader.readAsText(f);
  };
  const clearData = () => { setRows([]); setSourceName(''); setIsDemo(false); setNotice(null); };
  const useDemo = () => { setRows(SAMPLE_ROWS); setSourceName('Data contoh'); setIsDemo(true); setNotice(null); };
  const resetWeights = () => { setWeights({ ...DEFAULT_WEIGHTS }); setImportance({ ...DEFAULT_IMPORTANCE }); };

  const exportPriority = () => {
    const cols = ['Peringkat', 'Aspek', 'Jumlah sebutan', 'Positif', 'Netral', 'Negatif', 'Proporsi negatif (%)', 'Tren negatif (poin)', 'Kepentingan (1-5)', 'Skor prioritas', 'Level', 'Tema keluhan dominan', 'Rekomendasi'];
    const data = summary.aspects.map((a, i) => [i + 1, a.label, a.mentions, a.pos, a.neu, a.neg, Math.round(a.negRate * 100), a.trend.reliable ? Math.round(a.trend.delta * 100) : '', a.importance, a.score, a.level, a.topTheme?.label || '', a.topTheme?.rec || '']);
    download('prioritas-perbaikan-pmb.csv', toCsv(cols, data));
  };
  const exportExtraction = () => {
    const cols = ['Komentar', 'Tanggal', 'Sumber', 'Aspek', 'Sentimen', 'Tema keluhan'];
    const data = filtered.flatMap((r) => r.aspects.map((a) => [r.text, r.date || '', r.source, ASPECT_MAP[a.aspect].label, SENT_LABEL[a.sentiment], a.theme || '']));
    download('ekstraksi-aspek-sentimen-pmb.csv', toCsv(cols, data));
  };

  const engineLabel = predictorLabel || (predictor ? 'Model terhubung' : 'Mesin aturan kata kunci');

  return (
    <div className="ap">
      <header className="ap-head">
        <div>
          <p className="ap-eyebrow">Analisis lanjutan</p>
          <h1 className="ap-title">
            Analisis Aspek &amp; Prioritas Layanan
            <span className={`ap-tag ${!loaded ? '' : isDemo ? 'ap-tag--demo' : 'ap-tag--real'}`}>{!loaded ? 'Belum ada data' : isDemo ? 'Data contoh' : 'Data unggahan'}</span>
          </h1>
          <p className="ap-sub">Identifikasi aspek layanan PMB, sentimen per aspek, dan prioritas perbaikan berbasis komentar calon mahasiswa.</p>
        </div>
        <div className="ap-engine" title="Metode yang dipakai untuk menentukan aspek dan sentimen">
          <span className={`ap-dot-status ${predictor ? 'ap-dot-status--on' : ''}`} />
          <span>{engineLabel}</span>
        </div>
      </header>

      <input ref={fileRef} type="file" accept=".csv,.tsv,.txt,text/csv" hidden onChange={onFile} />
      {notice && !loaded && <p className={`ap-note ap-note--${notice.type}`} role="status">{notice.text}</p>}

      {loaded && (
        <section className="ap-card ap-data">
          <div className="ap-data__info">
            <strong>{sourceName}</strong>
            <span className="ap-muted">{rows.length} komentar dimuat{applied ? ` · ${summary.withAspect} dengan aspek teridentifikasi` : ''}</span>
            {isDemo && <span className="ap-muted">Angka di halaman ini dihitung dari data contoh. Unggah CSV untuk memakai data PMB sebenarnya.</span>}
          </div>
          <div className="ap-actions">
            <button type="button" className="ap-btn ap-btn--primary" onClick={() => fileRef.current?.click()}>Unggah CSV</button>
            {!isDemo && <button type="button" className="ap-btn" onClick={useDemo}>Pakai data contoh</button>}
            <button type="button" className="ap-btn" onClick={clearData}>Kosongkan</button>
          </div>
          {notice && <p className={`ap-note ap-note--${notice.type}`} role="status">{notice.text}</p>}
        </section>
      )}

      <section className="ap-card ap-filters" aria-label="Filter">
        <fieldset className="ap-period" disabled={!hasDates}>
          <legend>Periode PMB {PMB_YEAR}</legend>
          <div className="ap-period__row">
            <label>Dari tanggal
              <input type="date" min={DATE_MIN} max={DATE_MAX} value={dateFrom} onChange={(e) => onFrom(e.target.value)} />
            </label>
            <label>Sampai tanggal
              <input type="date" min={DATE_MIN} max={DATE_MAX} value={dateTo} onChange={(e) => onTo(e.target.value)} />
            </label>
          </div>
          {(dateFrom || dateTo) ? (
            <button type="button" className="ap-link" onClick={() => { setDateFrom(''); setDateTo(''); }}>Hapus periode</button>
          ) : (
            <small className="ap-muted">{!loaded ? 'Aktif setelah data dimuat.' : hasDates ? 'Pilih tanggal dari kalender. Kosong = semua tanggal.' : 'Data tidak memiliki kolom tanggal.'}</small>
          )}
        </fieldset>
        <label>Sumber
          <select value={sumber} onChange={(e) => setSumber(e.target.value)} disabled={!loaded}>
            <option value="all">Semua sumber</option>
            {sourceOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label>Aspek layanan
          <select value={aspek} onChange={(e) => setAspek(e.target.value)} disabled={!loaded}>
            <option value="all">Semua aspek</option>
            {ASPECTS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </label>
        <div className="ap-filters__actions">
          <button type="button" className="ap-btn ap-btn--dark" onClick={applyFilters} disabled={!loaded}>Terapkan Filter</button>
          <button type="button" className="ap-btn" onClick={resetFilters} disabled={!loaded && !applied}>Reset</button>
        </div>
      </section>

      {!applied ? (
        <section className="ap-card ap-blank">
          <h2>Belum ada analisis</h2>
          {!loaded ? (
            <>
              <p className="ap-muted">Unggah file CSV komentar calon mahasiswa, lalu atur filter dan tekan Terapkan Filter. Belum ada angka yang ditampilkan sampai pengecekan dilakukan.</p>
              <div className="ap-actions">
                <button type="button" className="ap-btn ap-btn--primary" onClick={() => fileRef.current?.click()}>Unggah CSV</button>
                <button type="button" className="ap-btn" onClick={useDemo}>Coba dengan data contoh</button>
                <button type="button" className="ap-btn" onClick={() => download('template-komentar-pmb.csv', CSV_TEMPLATE.trimEnd())}>Unduh template</button>
              </div>
            </>
          ) : (
            <p className="ap-muted">Data sudah dimuat. Atur Periode PMB, Sumber, dan Aspek (boleh dikosongkan), lalu tekan Terapkan Filter untuk melihat hasil.</p>
          )}
        </section>
      ) : busy ? <p className="ap-muted ap-pad">Menganalisis komentar…</p> : summary.total === 0 ? (
        <section className="ap-card ap-empty"><p>Tidak ada komentar pada filter ini. Ubah periode, sumber, atau aspek.</p></section>
      ) : (
        <>
          <section className="ap-kpis">
            <div className="ap-card ap-kpi"><span>Komentar dianalisis</span><strong>{summary.total}</strong><small>{summary.unclassified} tanpa aspek jelas</small></div>
            <div className="ap-card ap-kpi"><span>Aspek terdeteksi</span><strong>{active.length}<small> / {ASPECTS.length}</small></strong><small>{summary.mentionTotal} sebutan total</small></div>
            <div className="ap-card ap-kpi"><span>Sebutan negatif</span><strong>{pct(summary.negShare)}</strong><small>{summary.negTotal} dari {summary.mentionTotal}</small></div>
            <div className="ap-card ap-kpi ap-kpi--top"><span>Prioritas tertinggi</span><strong>{top ? top.label : '-'}</strong><small>{top ? `Skor ${top.score} · ${pct(top.negRate)} negatif` : ''}</small></div>
          </section>

          <section className="ap-card">
            <div className="ap-sec-head">
              <div>
                <h2>Peringkat prioritas perbaikan</h2>
                <p className="ap-muted">Klik baris untuk melihat akar keluhan dan contoh komentar.</p>
              </div>
              <button type="button" className="ap-btn" onClick={exportPriority}>Ekspor prioritas (CSV)</button>
            </div>
            <div className="ap-table-wrap">
              <table className="ap-table">
                <thead>
                  <tr><th>#</th><th>Aspek</th><th className="ap-num">Sebutan</th><th>Sentimen</th><th className="ap-num">Negatif</th><th>Tren</th><th>Kepentingan</th><th>Skor</th><th>Prioritas</th></tr>
                </thead>
                <tbody>
                  {shown.map((a) => {
                    const rank = summary.aspects.indexOf(a) + 1;
                    const open = expanded === a.id;
                    return (
                      <Fragment key={a.id}>
                        <tr className={`ap-row ${open ? 'is-open' : ''}`} onClick={() => setExpanded(open ? null : a.id)} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded(open ? null : a.id); } }} aria-expanded={open}>
                          <td>{rank}</td>
                          <td><strong>{a.label}</strong>{a.lowSample && <span className="ap-warn" title="Kurang dari 3 sebutan; skor kurang andal"> data sedikit</span>}</td>
                          <td className="ap-num">{a.mentions}</td>
                          <td className="ap-cell-bar"><SentimentBar a={a} /></td>
                          <td className="ap-num">{a.mentions ? pct(a.negRate) : '-'}</td>
                          <td><TrendCell trend={a.trend} /></td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <select className="ap-imp" aria-label={`Kepentingan ${a.label}`} value={importance[a.id]} onChange={(e) => setImportance({ ...importance, [a.id]: Number(e.target.value) })}>
                              {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                            </select>
                          </td>
                          <td className="ap-cell-score"><div className="ap-scorewrap"><div className="ap-score"><span className={`ap-score__fill ap-score__fill--${LEVEL_CLASS[a.level]}`} style={{ width: `${a.score}%` }} /></div><b>{a.mentions ? a.score : '-'}</b></div></td>
                          <td><LevelBadge level={a.level} /></td>
                        </tr>
                        {open && (
                          <tr className="ap-detail"><td colSpan={9}>
                            <p className="ap-muted">{a.description}</p>
                            {a.themes.length === 0 ? <p>Tidak ada keluhan pada aspek ini.</p> : (
                              <div className="ap-detail__grid">
                                {a.themes.map((t) => (
                                  <div key={t.label} className="ap-theme">
                                    <h4>{t.label} <span className="ap-count">{t.count} keluhan</span></h4>
                                    <p className="ap-rec"><b>Rekomendasi:</b> {t.rec}</p>
                                    <ul>{t.examples.map((ex, i) => <li key={i}>“{ex}”</li>)}</ul>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td></tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <div className="ap-two">
            <section className="ap-card">
              <h2>Matriks prioritas</h2>
              <p className="ap-muted">Kanan atas = sering dibahas dan banyak negatif. Ukuran titik = skor prioritas.</p>
              <PriorityMatrix aspects={summary.aspects} onPick={(id) => { setExpanded(id); }} />
            </section>

            <section className="ap-card">
              <h2>Tema keluhan dominan</h2>
              {summary.themesAll.length === 0 ? <p className="ap-muted">Belum ada keluhan.</p> : (
                <ol className="ap-themes">
                  {summary.themesAll.map((t) => (
                    <li key={`${t.aspectId}-${t.label}`}>
                      <div className="ap-themes__row"><span>{t.label}</span><b>{t.count}</b></div>
                      <div className="ap-themes__bar"><span style={{ width: `${(t.count / summary.themesAll[0].count) * 100}%` }} /></div>
                      <small className="ap-muted">{t.aspectLabel}</small>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>

          <section className="ap-card">
            <h2>Rekomendasi tindakan</h2>
            {recs.length === 0 ? <p className="ap-muted">Belum ada aspek berprioritas tinggi atau sedang.</p> : (
              <ol className="ap-recs">
                {recs.map((a) => (
                  <li key={a.id}>
                    <div><strong>{a.label}</strong> <LevelBadge level={a.level} /></div>
                    <p>{a.neg} dari {a.mentions} sebutan negatif ({pct(a.negRate)}){a.topTheme ? `, terutama: ${a.topTheme.label.toLowerCase()}` : ''}.</p>
                    {a.topTheme && <p className="ap-rec"><b>Saran:</b> {a.topTheme.rec}</p>}
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="ap-card">
            <h2>Cara skor dihitung</h2>
            <p className="ap-muted">Skor (0–100) = jumlah dari bobot × nilai kriteria. Bobot dapat disesuaikan Panitia dan tersimpan di browser ini.</p>
            <div className="ap-weights">
              {CRITERIA.map((c) => (
                <label key={c.id} title={c.hint}>
                  <span>{c.label} <b>{Math.round(wNorm[c.id] * 100)}%</b></span>
                  <input type="range" min="0" max="100" step="5" value={weights[c.id]} onChange={(e) => setWeights({ ...weights, [c.id]: Number(e.target.value) })} />
                  <small className="ap-muted">{c.hint}</small>
                </label>
              ))}
            </div>
            <div className="ap-actions">
              <button type="button" className="ap-btn" onClick={resetWeights}>Kembalikan bobot awal</button>
              <span className="ap-muted">Level: Tinggi ≥ 60, Sedang 40–59, Rendah &lt; 40. Tren dihitung dari paruh awal vs paruh akhir data terfilter.</span>
            </div>
          </section>

          <section className="ap-card">
            <div className="ap-sec-head">
              <div>
                <h2>Contoh ekstraksi aspek–sentimen</h2>
                <p className="ap-muted">{extraction.length} komentar sesuai filter.</p>
              </div>
              <div className="ap-actions">
                <input className="ap-search" type="search" placeholder="Cari komentar…" value={query} onChange={(e) => { setQuery(e.target.value); setLimit(10); }} aria-label="Cari komentar" />
                <button type="button" className="ap-btn" onClick={exportExtraction}>Ekspor ekstraksi (CSV)</button>
              </div>
            </div>
            <div className="ap-table-wrap">
              <table className="ap-table ap-table--ex">
                <thead><tr><th>Komentar</th><th>Aspek &amp; sentimen</th><th>Sumber</th><th>Tanggal</th></tr></thead>
                <tbody>
                  {extraction.slice(0, limit).map((r) => (
                    <tr key={r.id}>
                      <td>{r.text}</td>
                      <td><div className="ap-chips">{r.aspects.map((a) => <span key={a.aspect} className={`ap-chip ap-chip--${a.sentiment}`}>{ASPECT_MAP[a.aspect].label}: {SENT_LABEL[a.sentiment]}</span>)}</div></td>
                      <td>{r.source}</td>
                      <td>{r.date || '-'}</td>
                    </tr>
                  ))}
                  {extraction.length === 0 && <tr><td colSpan={4} className="ap-muted">Tidak ada komentar yang cocok.</td></tr>}
                </tbody>
              </table>
            </div>
            {extraction.length > limit && <button type="button" className="ap-btn ap-more" onClick={() => setLimit(limit + 20)}>Tampilkan lebih banyak</button>}
          </section>

          <p className="ap-foot ap-muted">
            Metode: aspek dan sentimen ditentukan oleh {predictor ? 'model yang dihubungkan' : 'aturan kata kunci dan leksikon sentimen bahasa Indonesia (offline)'}. Satu komentar dapat memuat beberapa aspek; bila ada sentimen campuran pada satu aspek, hasilnya dicatat negatif agar keluhan tidak terlewat. Validasi hasil bersama Panitia sebelum dipakai sebagai dasar keputusan.
          </p>
        </>
      )}
    </div>
  );
}
