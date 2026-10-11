import { Activity, MessageSquare, ThumbsDown, TrendingUp, ArrowUpRight } from "lucide-react";
import { useMemo } from "react";
import { useDataset } from "../context/DatasetContext.jsx";
import { parseFlexibleDate } from "../utils/date.js";

const colors = { Positive: "#23996b", Neutral: "#d78a25", Negative: "#d94b57" };
const pct = (n, total) => total ? `${(n / total * 100).toFixed(1)}%` : "0%";

export default function Dashboard() {
  const { rows, ready, sourceName, cloudState } = useDataset();
  const summary = useMemo(() => {
    const counts = { Positive: 0, Neutral: 0, Negative: 0 };
    const sourceCounts = {};
    const monthly = {};
    let datedRows = 0;

    rows.forEach(row => {
      const label = ["Positive", "Neutral", "Negative"].includes(row.label) ? row.label : "Neutral";
      counts[label] += 1;
      const source = row.source || "Import";
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      const date = parseFlexibleDate(row.date);
      if (!date) return;
      datedRows += 1;
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthly[month]) monthly[month] = { month, Positive: 0, Neutral: 0, Negative: 0, total: 0 };
      monthly[month][label] += 1;
      monthly[month].total += 1;
    });

    const pie = ["Positive", "Neutral", "Negative"].map(name => ({ name, value: counts[name] }));
    const allMonthly = Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month));
    const trend = allMonthly.slice(-8);
    const trendTotal = trend.reduce((sum, month) => sum + month.total, 0);
    const olderDatedRows = Math.max(0, datedRows - trendTotal);
    const trendRangeLabel = trend.length
      ? `${formatMonthLabel(trend[0].month)}–${formatMonthLabel(trend[trend.length - 1].month)}`
      : "Belum ada rentang";
    return {
      counts, pie,
      sources: Object.entries(sourceCounts).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count),
      trend, datedRows, undatedRows: rows.length - datedRows,
      trendTotal, olderDatedRows, trendRangeLabel,
    };
  }, [rows]);

  const negatives = rows.filter(row => row.label === "Negative").sort((a, b) => b.confidence - a.confidence).slice(0, 5);
  const maxTrend = Math.max(1, ...summary.trend.map(row => row.total));
  const totalSentiments = summary.pie.reduce((sum, item) => sum + item.value, 0);
  let runningPercent = 0;
  const donutStops = summary.pie.filter(item => item.value > 0).map(item => {
    const start = runningPercent;
    runningPercent += item.value / Math.max(1, totalSentiments) * 100;
    return `${colors[item.name]} ${start}% ${runningPercent}%`;
  });
  const donutBackground = donutStops.length ? `conic-gradient(${donutStops.join(", ")})` : "#f0ebf3";

  if (!ready) return <div className="loading-card">Memuat dataset…</div>;

  const dataStatusLabel = cloudState?.status === "connected"
    ? "Data tersinkron"
    : cloudState?.status === "loading"
      ? "Memuat data cloud"
      : cloudState?.status === "error"
        ? "Periksa koneksi cloud"
        : "Data lokal";

  return <div className="page-stack">
    <div className="page-intro"><div><div className="eyebrow">RINGKASAN</div><h2>Ringkasan Sentimen PMB</h2><p>Rekap seluruh komentar dalam dataset yang sedang digunakan.</p></div><div className="live-pill" title={cloudState?.message || dataStatusLabel}><i/> {dataStatusLabel}</div></div>
    <div className="stat-grid">
      <Stat label="Total komentar" value={rows.length} note="Semua data aktif" icon={MessageSquare} tone="purple"/>
      <Stat label="Positif" value={summary.counts.Positive} note={`${pct(summary.counts.Positive, rows.length)} dari data`} icon={TrendingUp} tone="green"/>
      <Stat label="Netral" value={summary.counts.Neutral} note={`${pct(summary.counts.Neutral, rows.length)} dari data`} icon={Activity} tone="orange"/>
      <Stat label="Negatif" value={summary.counts.Negative} note={`${pct(summary.counts.Negative, rows.length)} dari data`} icon={ThumbsDown} tone="red"/>
    </div>

    <div className="chart-grid">
      <section className="panel"><PanelHead title="Tren sentimen" note={summary.trend.length ? `8 bulan terbaru yang memiliki data · ${summary.trendRangeLabel}` : "Jumlah komentar per bulan berdasarkan tanggal yang terbaca"}/>
        {summary.trend.length ? <>
          <div className="trend-native" aria-label="Grafik batang tren sentimen">
            <div className="trend-y-axis"><span>{maxTrend}</span><span>{Math.round(maxTrend / 2)}</span><span>0</span></div>
            <div className="trend-plot">
              {summary.trend.map(month => {
                const barHeight = Math.max(5, month.total / maxTrend * 170);
                return <div className="trend-column" key={month.month} title={`${month.month}: ${month.total} komentar`}>
                  <span className="trend-count">{month.total}</span>
                  <div className="trend-bar-stack" style={{ height: `${barHeight}px` }}>
                    {month.Positive > 0 && <div className="trend-segment positive" style={{ flex: month.Positive }} />}
                    {month.Neutral > 0 && <div className="trend-segment neutral" style={{ flex: month.Neutral }} />}
                    {month.Negative > 0 && <div className="trend-segment negative" style={{ flex: month.Negative }} />}
                  </div>
                  <span className="trend-month">{month.month}</span>
                </div>;
              })}
            </div>
          </div>
          <div className="native-chart-legend"><LegendItem color={colors.Positive} label="Positif"/><LegendItem color={colors.Neutral} label="Netral"/><LegendItem color={colors.Negative} label="Negatif"/></div>
          {(summary.olderDatedRows > 0 || summary.undatedRows > 0) && <p className="chart-hint">Grafik menampilkan {summary.trendTotal.toLocaleString("id-ID")} komentar pada rentang {summary.trendRangeLabel}. {summary.olderDatedRows > 0 ? `${summary.olderDatedRows.toLocaleString("id-ID")} komentar bertanggal dari periode yang lebih lama tidak ditampilkan. ` : ""}{summary.undatedRows > 0 ? `${summary.undatedRows.toLocaleString("id-ID")} komentar tidak memiliki tanggal yang dapat dibaca.` : ""}</p>}
        </> : <Empty text={rows.length ? `Tanggal tidak dikenali pada ${summary.undatedRows} komentar. Periksa kolom tanggal di CSV agar komentar tersebut dapat masuk ke grafik tren.` : "Grafik tren akan muncul setelah CSV berisi komentar dan tanggal diimpor."}/>}
      </section>

      <section className="panel"><PanelHead title="Distribusi sentimen" note="Proporsi komentar menurut label sentimen"/>
        <div className="donut-wrap">
          <div className="native-donut-frame">
            <div className={`native-donut${rows.length ? "" : " is-empty"}`} style={{ background: donutBackground }} aria-label="Grafik donat distribusi sentimen">
              <div className="native-donut-hole"><strong>{rows.length.toLocaleString("id-ID")}</strong><span>komentar</span></div>
            </div>
          </div>
          <div className="sentiment-legend">{summary.pie.map(item => <div className="legend-row" key={item.name}><i style={{ background: colors[item.name] }}/><span>{{Positive:"Positif",Neutral:"Netral",Negative:"Negatif"}[item.name]}</span><strong>{item.value.toLocaleString("id-ID")}</strong><small>{pct(item.value, rows.length)}</small></div>)}</div>
        </div>
        {!rows.length && <p className="chart-hint">Distribusi akan terisi otomatis setelah impor CSV berhasil menambahkan data.</p>}
      </section>
    </div>

    <section className="panel"><PanelHead title="Jumlah komentar per sumber" note="Jumlah data menurut platform atau file impor"/>
      {summary.sources.length ? <div className="source-grid">{summary.sources.map(item => <div className="source-card" key={item.source}><span className="source-avatar">{item.source.toLowerCase().includes("tik") ? "TT" : item.source.toLowerCase().includes("insta") ? "IG" : "CSV"}</span><div><span>{item.source}</span><strong>{item.count.toLocaleString("id-ID")}</strong></div><ArrowUpRight size={17}/></div>)}</div> : <Empty text="Belum ada sumber data. Impor CSV melalui menu Dataset."/>}
    </section>

    <section className="panel"><PanelHead title="Komentar negatif untuk ditinjau" note="Urut berdasarkan tingkat keyakinan prediksi; periksa konteks sebelum mengambil tindakan"/>
      {negatives.length ? <div className="negative-list">{negatives.map((row, index) => <div className="negative-item" key={row.id}><span className="number-chip">{index + 1}</span><div className="negative-content"><p>{row.comment}</p><span>{row.source} · {row.username} · {row.date || "Tanggal tidak tersedia"}</span></div><strong>{(row.confidence * 100).toFixed(1)}%</strong></div>)}</div> : <Empty text="Belum ada komentar dengan sentimen negatif."/>}
    </section>
    <p className="data-note">Sumber data: {sourceName}. Nilai pada halaman ini mengikuti seluruh dataset aktif.</p>
  </div>;
}

function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("id-ID", {
    month: "short",
    year: "numeric",
  });
}

function Stat({ label, value, note, icon: Icon, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><span className="stat-label">{label}</span><strong className="stat-value">{Number(value).toLocaleString("id-ID")}</strong><span className="stat-note">{note}</span></div>;
}
function PanelHead({ title, note }) { return <div className="panel-heading"><div><h3>{title}</h3><p>{note}</p></div></div>; }
function Empty({ text }) { return <div className="empty-chart">{text}</div>; }
function LegendItem({ color, label }) { return <span className="native-legend-item"><i style={{ background: color }}/>{label}</span>; }
