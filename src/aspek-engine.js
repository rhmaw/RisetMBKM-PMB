export const SENTIMENTS = ['positif', 'netral', 'negatif'];


export const ASPECTS = [
  {
    id: 'pendaftaran', label: 'Pendaftaran', importance: 5,
    description: 'Alur, formulir, unggah dan verifikasi berkas, jalur dan gelombang pendaftaran.',
    keywords: ['daftar', 'mendaftar', 'pendaftaran', 'registrasi', 'formulir', 'berkas', 'dokumen', 'upload', 'unggah', 'verifikasi', 'jalur', 'gelombang', 'ujian'],
    themes: [
      { label: 'Sistem/formulir error saat mendaftar', patterns: ['error', 'eror', 'gagal', 'gangguan', 'down', 'macet', 'lemot', 'hang', 'tidak bisa', 'submit'], rec: 'Cek kapasitas server saat gelombang puncak dan siapkan kanal bantuan teknis khusus pendaftaran.' },
      { label: 'Verifikasi berkas lama', patterns: ['verifikasi', 'menunggu', 'belum ada kabar', 'diproses', 'telat', 'kapan'], rec: 'Tetapkan SLA verifikasi berkas dan kirim notifikasi status otomatis kepada calon mahasiswa.' },
      { label: 'Alur pendaftaran membingungkan', patterns: ['bingung', 'ribet', 'rumit', 'susah', 'sulit', 'berbelit', 'membingungkan'], rec: 'Sederhanakan alur dan sediakan panduan langkah demi langkah (infografis atau video singkat).' },
    ],
  },
  {
    id: 'biaya', label: 'Biaya', importance: 5,
    description: 'Biaya kuliah, rincian biaya, metode dan skema pembayaran.',
    keywords: ['biaya', 'bayar', 'pembayaran', 'spp', 'ukt', 'uang', 'harga', 'mahal', 'murah', 'cicil', 'cicilan', 'angsuran', 'tarif', 'dpp', 'keringanan', 'terjangkau'],
    themes: [
      { label: 'Rincian biaya tidak transparan', patterns: ['rincian', 'transparan', 'tidak jelas', 'tersembunyi', 'tambahan', 'bingung'], rec: 'Publikasikan rincian biaya lengkap per program studi di satu halaman resmi dan brosur.' },
      { label: 'Biaya dinilai mahal', patterns: ['mahal', 'tinggi', 'berat', 'mencekik'], rec: 'Komunikasikan nilai manfaat biaya dan tawarkan skema cicilan atau jalur biaya ringan.' },
      { label: 'Metode/skema pembayaran terbatas', patterns: ['cicil', 'angsuran', 'metode', 'transfer', 'virtual account', 'link', 'gagal', 'tidak bisa', 'error'], rec: 'Tambahkan pilihan metode dan cicilan pembayaran serta konfirmasi pembayaran otomatis.' },
    ],
  },
  {
    id: 'beasiswa', label: 'Beasiswa', importance: 4,
    description: 'Informasi, syarat, seleksi, dan kuota beasiswa (termasuk KIP-K).',
    keywords: ['beasiswa', 'kip$', 'bidikmisi', 'keringanan'],
    themes: [
      { label: 'Informasi/syarat beasiswa tidak jelas', patterns: ['tidak jelas', 'simpang siur', 'syarat', 'persyaratan', 'bingung', 'berbeda'], rec: 'Buat satu halaman beasiswa berisi jenis, syarat, alur, dan jadwal; samakan jawaban admin.' },
      { label: 'Proses seleksi beasiswa lama', patterns: ['lama', 'menunggu', 'pengumuman', 'belum ada', 'telat'], rec: 'Umumkan jadwal seleksi dan hasil beasiswa secara tegas serta kirim pemberitahuan status.' },
      { label: 'Kuota beasiswa terbatas', patterns: ['kuota', 'terbatas', 'sedikit', 'habis'], rec: 'Informasikan kuota dan peluang tiap jenis beasiswa sejak awal.' },
    ],
  },
  {
    id: 'pelayanan', label: 'Pelayanan Admin', importance: 4,
    description: 'Sikap, kecepatan, dan konsistensi layanan admin/panitia.',
    keywords: ['admin', 'petugas', 'staf', 'staff', 'panitia', 'pelayanan', 'layanan', 'cs$', 'customer', 'ramah', 'sopan', 'judes', 'cuek'],
    themes: [
      { label: 'Respons admin lambat', patterns: ['lambat', 'lama', 'lelet', 'menunggu', 'tidak dibalas', 'belum dibalas', 'diabaikan'], rec: 'Atur jadwal piket admin dan target waktu respons maksimal (mis. 1x24 jam).' },
      { label: 'Sikap kurang ramah', patterns: ['judes', 'cuek', 'tidak ramah', 'kasar', 'ketus', 'sombong', 'acuh'], rec: 'Adakan pelatihan singkat pelayanan prima dan panduan bahasa untuk admin.' },
      { label: 'Jawaban admin tidak konsisten', patterns: ['berbeda', 'beda', 'tidak konsisten', 'simpang siur', 'salah informasi'], rec: 'Susun FAQ resmi dan skrip jawaban baku agar informasi seragam.' },
    ],
  },
  {
    id: 'informasi', label: 'Informasi PMB', importance: 4,
    description: 'Kelengkapan, kejelasan, dan keterbaruan informasi syarat, jadwal, brosur.',
    keywords: ['info$', 'informasi', 'brosur', 'jadwal', 'syarat', 'persyaratan', 'panduan', 'petunjuk', 'pengumuman', 'penjelasan'],
    themes: [
      { label: 'Informasi tidak diperbarui', patterns: ['tidak update', 'belum update', 'kadaluarsa', 'usang', 'berbeda', 'tidak sama', 'ketinggalan'], rec: 'Tetapkan penanggung jawab dan jadwal pembaruan informasi pada tiap gelombang.' },
      { label: 'Informasi tidak jelas/lengkap', patterns: ['tidak jelas', 'kurang jelas', 'tidak lengkap', 'kurang lengkap', 'minim', 'bingung', 'simpang siur', 'membingungkan'], rec: 'Rapikan informasi syarat, jadwal, dan alur dalam satu sumber resmi yang mudah dicari.' },
    ],
  },
  {
    id: 'komunikasi', label: 'Komunikasi', importance: 4,
    description: 'Kemudahan dihubungi dan kecepatan balasan di WhatsApp, telepon, DM, dan email.',
    keywords: ['wa$', 'whatsapp', 'balas', 'membalas', 'dibalas', 'balasan', 'respon', 'respons', 'merespons', 'hubungi', 'dihubungi', 'telepon', 'telpon', 'chat', 'dm$', 'kontak', 'email', 'diangkat'],
    themes: [
      { label: 'Kanal sulit dihubungi', patterns: ['sulit dihubungi', 'susah dihubungi', 'tidak bisa dihubungi', 'tidak diangkat', 'nomor tidak aktif', 'tidak aktif'], rec: 'Sediakan kanal resmi terpadu dan pastikan nomor kontak aktif pada jam layanan.' },
      { label: 'Balasan/respons lambat', patterns: ['lambat', 'lama', 'lelet', 'tidak dibalas', 'belum dibalas', 'tidak direspon', 'diabaikan', 'menunggu', 'berhari-hari'], rec: 'Pasang auto-reply, FAQ cepat, dan target SLA balasan pada WhatsApp dan DM.' },
    ],
  },
  {
    id: 'website', label: 'Website & Sistem', importance: 3,
    description: 'Kinerja, tampilan, navigasi, login/akun, dan stabilitas website atau sistem.',
    keywords: ['website', 'web$', 'situs', 'laman', 'halaman', 'portal', 'aplikasi', 'link', 'tautan', 'login', 'akun', 'password', 'sandi', 'loading', 'server', 'sistem', 'tampilan', 'menu$'],
    themes: [
      { label: 'Website lambat/error/down', patterns: ['lambat', 'lemot', 'error', 'eror', 'down', 'gangguan', 'loading', 'hang', 'tidak bisa', 'gagal', 'macet'], rec: 'Optimalkan performa dan pantau uptime; siapkan skalasi server saat puncak pendaftaran.' },
      { label: 'Masalah login/akun', patterns: ['login', 'akun', 'password', 'sandi', 'lupa', 'otp', 'reset'], rec: 'Perbaiki alur login dan reset kata sandi serta sediakan bantuan akun.' },
      { label: 'Tampilan/navigasi membingungkan', patterns: ['bingung', 'ribet', 'navigasi', 'berantakan', 'tidak rapi', 'susah dicari', 'membingungkan'], rec: 'Rapikan navigasi dan susun ulang menu berdasarkan tugas utama calon mahasiswa.' },
    ],
  },
  {
    id: 'prodi', label: 'Program Studi', importance: 3,
    description: 'Informasi, kurikulum, akreditasi, dan pilihan program studi.',
    keywords: ['prodi', 'program studi', 'jurusan', 'kurikulum', 'akreditasi', 'konsentrasi', 'mata kuliah', 'dosen', 'prospek', 'karier', 'karir'],
    themes: [
      { label: 'Informasi prodi kurang detail', patterns: ['kurang', 'tidak jelas', 'minim', 'bingung', 'tidak lengkap'], rec: 'Tambahkan profil prodi: kurikulum, prospek karier, dan akreditasi.' },
      { label: 'Pilihan prodi terbatas', patterns: ['terbatas', 'sedikit', 'tidak ada', 'kurang banyak'], rec: 'Kaji kebutuhan pasar dan komunikasikan rencana pengembangan prodi.' },
    ],
  },
  {
    id: 'fasilitas', label: 'Fasilitas', importance: 3,
    description: 'Gedung, laboratorium, perpustakaan, parkir, dan sarana kampus.',
    keywords: ['fasilitas', 'gedung', 'kelas', 'ruang', 'laboratorium', 'lab$', 'perpustakaan', 'wifi', 'parkir', 'asrama', 'kantin', 'ac$', 'toilet'],
    themes: [
      { label: 'Parkir/akses kampus', patterns: ['parkir', 'macet', 'jauh', 'akses'], rec: 'Evaluasi kapasitas parkir dan akses transportasi terutama pada hari kegiatan PMB.' },
      { label: 'Fasilitas kurang memadai', patterns: ['kurang', 'minim', 'sempit', 'rusak', 'kotor', 'panas', 'sedikit', 'penuh'], rec: 'Petakan fasilitas yang paling dikeluhkan dan masukkan ke rencana perawatan dan pengadaan.' },
    ],
  },
  {
    id: 'promosi', label: 'Promosi', importance: 2,
    description: 'Jangkauan dan daya tarik promosi, media sosial, event, dan sosialisasi.',
    keywords: ['promosi', 'iklan', 'sosmed', 'media sosial', 'konten', 'postingan', 'event', 'open house', 'roadshow', 'sosialisasi', 'webinar', 'campus tour'],
    themes: [
      { label: 'Konten promosi kurang menarik', patterns: ['membosankan', 'monoton', 'biasa saja', 'tidak menarik', 'kurang menarik'], rec: 'Segarkan format konten (video pendek, testimoni mahasiswa) dan uji pada segmen sasaran.' },
      { label: 'Promosi kurang menjangkau', patterns: ['kurang', 'minim', 'jarang', 'tidak tahu', 'baru tahu', 'sepi', 'menjangkau'], rec: 'Perluas promosi ke sekolah dan kanal sosial media sesuai segmen; evaluasi jangkauan per kanal.' },
    ],
  },
];

export const ASPECT_MAP = Object.fromEntries(ASPECTS.map((a) => [a.id, a]));
export const DEFAULT_IMPORTANCE = Object.fromEntries(ASPECTS.map((a) => [a.id, a.importance]));

export const CRITERIA = [
  { id: 'freq', label: 'Frekuensi sebutan', hint: 'Seberapa sering aspek dibicarakan dibanding aspek lain.' },
  { id: 'neg', label: 'Proporsi negatif', hint: 'Porsi sebutan bersentimen negatif pada aspek tersebut.' },
  { id: 'trend', label: 'Tren memburuk', hint: 'Kenaikan proporsi negatif pada paruh waktu terbaru dibanding paruh awal.' },
  { id: 'imp', label: 'Tingkat kepentingan', hint: 'Penilaian Panitia (1-5) atas dampak aspek terhadap keputusan calon mahasiswa.' },
];
export const DEFAULT_WEIGHTS = { freq: 30, neg: 35, trend: 15, imp: 20 };

export const LEVELS = { HIGH: 'Tinggi', MID: 'Sedang', LOW: 'Rendah', NONE: 'Belum ada data' };
export const LEVEL_THRESHOLDS = { high: 60, mid: 40 };


const SLANG = {
  gak: 'tidak', ga: 'tidak', nggak: 'tidak', ngga: 'tidak', gk: 'tidak', tdk: 'tidak', tak: 'tidak',
  gabisa: 'tidak bisa', yg: 'yang', bgt: 'banget', bngt: 'banget', udh: 'sudah', sdh: 'sudah',
  blm: 'belum', blum: 'belum', bs: 'bisa', krn: 'karena', dgn: 'dengan', utk: 'untuk', dr: 'dari',
  jd: 'jadi', admn: 'admin', makasih: 'terima kasih', thanks: 'terima kasih', thx: 'terima kasih',
  tks: 'terima kasih', nunggu: 'menunggu', nungguin: 'menunggu', gampang: 'mudah', bagus2: 'bagus',
  eror: 'error', telpon: 'telepon', dicuekin: 'diabaikan',
};

export function normalize(text) {
  let t = String(text ?? '').toLowerCase();
  t = t.replace(/https?:\/\/\S+/g, ' ').replace(/@\w+/g, ' ').replace(/#/g, ' ');
  t = t.replace(/["'`\u2018\u2019\u201c\u201d]/g, '');
  t = t.replace(/(.)\1{2,}/g, '$1$1');
  t = t.replace(/[^a-z0-9\s.,!?;\-]/g, ' ');
  t = t.replace(/[a-z0-9]+/g, (w) => SLANG[w] || w);
  return t.replace(/\s+/g, ' ').trim();
}


const POS = new Set(['bagus', 'baik', 'mudah', 'cepat', 'ramah', 'membantu', 'terbantu', 'jelas', 'lengkap', 'murah', 'terjangkau', 'puas', 'memuaskan', 'senang', 'mantap', 'keren', 'nyaman', 'responsif', 'informatif', 'lancar', 'bersih', 'modern', 'rekomendasi', 'recommended', 'suka', 'oke', 'profesional', 'sigap', 'gratis', 'menarik', 'praktis', 'simpel', 'transparan', 'sopan', 'seru', 'luas', 'terbaik', 'sempurna', 'rapi', 'ringan', 'dipahami', 'aman']);
const NEG = new Set(['lambat', 'lama', 'susah', 'sulit', 'ribet', 'rumit', 'bingung', 'membingungkan', 'mahal', 'error', 'gagal', 'lemot', 'down', 'macet', 'buruk', 'jelek', 'kecewa', 'mengecewakan', 'lelet', 'cuek', 'judes', 'ketus', 'kasar', 'berbelit', 'telat', 'sempit', 'panas', 'kotor', 'rusak', 'minim', 'gangguan', 'hilang', 'salah', 'masalah', 'kendala', 'keluhan', 'complain', 'kadaluarsa', 'antri', 'antre', 'penuh', 'hang', 'berantakan', 'monoton', 'membosankan', 'simpang', 'sepi', 'tidak ramah', 'parah', 'menyulitkan', 'merugikan']);
const NEGATORS = new Set(['tidak', 'belum', 'kurang', 'bukan', 'tanpa', 'jangan']);
const INTENSIFIERS = new Set(['banget', 'sekali', 'sangat', 'terlalu', 'parah']);
const NEG_PHRASES = ['tidak dibalas', 'belum dibalas', 'tidak direspon', 'tidak direspons', 'tidak ada balasan', 'tidak ada respon', 'tidak ada respons', 'tidak diangkat', 'diabaikan', 'dibaca doang', 'cuma dibaca', 'tidak bisa dihubungi', 'sulit dihubungi', 'susah dihubungi', 'tidak ada kejelasan', 'tidak transparan', 'tidak update', 'belum update', 'tidak bisa', 'belum ada kabar', 'tidak ada cicilan', 'tidak memadai'];
const POS_PHRASES = ['terima kasih', 'sangat membantu', 'cepat dibalas', 'mudah dipahami', 'tidak ada masalah'];

export function scoreText(norm) {
  let score = 0;
  let text = ` ${norm} `;
  for (const p of NEG_PHRASES) if (text.includes(` ${p} `) || text.includes(` ${p}.`) || text.includes(` ${p},`)) { score -= 2; text = text.split(p).join(' '); }
  for (const p of POS_PHRASES) if (text.includes(p)) { score += 2; text = text.split(p).join(' '); }
  const tokens = text.match(/[a-z0-9]+(?:-[a-z0-9]+)*/g) || [];
  for (let i = 0; i < tokens.length; i += 1) {
    const t = tokens[i];
    let v = POS.has(t) ? 1 : NEG.has(t) ? -1 : 0;
    if (!v) continue;
    if (NEGATORS.has(tokens[i - 1]) || NEGATORS.has(tokens[i - 2])) v = -v;
    if (INTENSIFIERS.has(tokens[i + 1]) || INTENSIFIERS.has(tokens[i - 1])) v *= 1.5;
    score += v;
  }
  return score;
}

const labelOf = (s) => (s > 0.5 ? 'positif' : s < -0.5 ? 'negatif' : 'netral');

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ASPECT_REGEX = ASPECTS.map((a) => ({
  id: a.id,
  re: new RegExp(
    a.keywords
      .map((k) => (k.endsWith('$') ? `(?:^|[^a-z0-9])${esc(k.slice(0, -1))}(?![a-z0-9])` : `(?:^|[^a-z0-9])${esc(k)}`))
      .join('|'),
  ),
}));

export function detectAspects(clause) {
  return ASPECT_REGEX.filter((a) => a.re.test(clause)).map((a) => a.id);
}

const CLAUSE_SPLIT = /[.!?;\n]+|,|\s(?:tapi|namun|tetapi|sayangnya|sedangkan|cuma|hanya saja)\s/;

export function ruleBasedPredict(text) {
  const norm = normalize(text);
  const clauses = norm.split(CLAUSE_SPLIT).map((s) => s.trim()).filter(Boolean);
  const scored = clauses.map((c) => ({ c, s: scoreText(c), asp: detectAspects(c) }));
  const overall = scored.reduce((a, x) => a + x.s, 0);
  const map = new Map();
  for (const x of scored) {
    for (const id of x.asp) {
      const s = x.s !== 0 ? x.s : overall;
      const e = map.get(id) || { aspect: id, scores: [], evidence: x.c, best: 0 };
      e.scores.push(s);
      if (Math.abs(s) >= Math.abs(e.best)) { e.best = s; e.evidence = x.c; }
      map.set(id, e);
    }
  }
  const aspects = [...map.values()].map((e) => ({
    aspect: e.aspect,
    sentiment: e.scores.some((s) => s < -0.5) ? 'negatif' : e.scores.some((s) => s > 0.5) ? 'positif' : 'netral',
    evidence: e.evidence,
  }));
  return { aspects, overall: labelOf(overall), norm };
}

function assignTheme(aspectId, evidence, norm) {
  const asp = ASPECT_MAP[aspectId];
  if (!asp) return 'Keluhan lain';
  const hit = (txt) => asp.themes.find((th) => th.patterns.some((p) => txt.includes(p)));
  const th = (evidence && hit(evidence)) || hit(norm || '');
  return th ? th.label : 'Keluhan lain';
}

export function periodOf(iso) {
  if (!iso) return null;
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7));
  return m >= 9 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
}

export async function analyzeRows(rows, predictor = ruleBasedPredict) {
  const out = [];
  for (const r of rows) {
    let p;
    try { p = await predictor(r.text); } catch { p = { aspects: [], overall: 'netral' }; }
    const norm = p.norm || normalize(r.text);
    const rowLabel = SENTIMENTS.includes(r.label) ? r.label : null; // label sentimen dari dataset (hasil model/anotasi)
    const aspects = (p.aspects || [])
      .filter((a) => ASPECT_MAP[a.aspect])
      .map((a) => {
        const sentiment = rowLabel || (SENTIMENTS.includes(a.sentiment) ? a.sentiment : 'netral');
        return { aspect: a.aspect, sentiment, theme: sentiment === 'negatif' ? assignTheme(a.aspect, a.evidence, norm) : null };
      });
    out.push({ id: r.id, text: r.text, date: r.date || null, source: r.source || '-', periode: periodOf(r.date), aspects, overall: rowLabel || p.overall || 'netral' });
  }
  return out;
}


const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));

export function levelOf(score, mentions) {
  if (!mentions) return LEVELS.NONE;
  if (score >= LEVEL_THRESHOLDS.high) return LEVELS.HIGH;
  if (score >= LEVEL_THRESHOLDS.mid) return LEVELS.MID;
  return LEVELS.LOW;
}

export function summarize(results, { weights = DEFAULT_WEIGHTS, importance = DEFAULT_IMPORTANCE } = {}) {
  const total = results.length;
  const dates = results.filter((r) => r.date).map((r) => r.date).sort();
  const splitDate = dates.length >= 6 ? dates[Math.floor(dates.length / 2)] : null;

  const stats = Object.fromEntries(ASPECTS.map((a) => [a.id, { mentions: 0, pos: 0, neu: 0, neg: 0, eM: 0, eN: 0, lM: 0, lN: 0, themes: new Map(), examples: [] }]));
  let withAspect = 0;
  for (const r of results) {
    if (r.aspects.length) withAspect += 1;
    for (const a of r.aspects) {
      const s = stats[a.aspect];
      s.mentions += 1;
      if (a.sentiment === 'positif') s.pos += 1; else if (a.sentiment === 'negatif') s.neg += 1; else s.neu += 1;
      if (splitDate && r.date) {
        if (r.date < splitDate) { s.eM += 1; if (a.sentiment === 'negatif') s.eN += 1; }
        else { s.lM += 1; if (a.sentiment === 'negatif') s.lN += 1; }
      }
      if (a.sentiment === 'negatif') {
        const th = s.themes.get(a.theme) || { label: a.theme, count: 0, examples: [] };
        th.count += 1;
        if (th.examples.length < 3) th.examples.push(r.text);
        s.themes.set(a.theme, th);
      }
    }
  }

  const maxMentions = Math.max(0, ...Object.values(stats).map((s) => s.mentions));
  const wRaw = { freq: Number(weights.freq) || 0, neg: Number(weights.neg) || 0, trend: Number(weights.trend) || 0, imp: Number(weights.imp) || 0 };
  const wSum = wRaw.freq + wRaw.neg + wRaw.trend + wRaw.imp || 1;
  const w = { freq: wRaw.freq / wSum, neg: wRaw.neg / wSum, trend: wRaw.trend / wSum, imp: wRaw.imp / wSum };

  const aspects = ASPECTS.map((meta) => {
    const s = stats[meta.id];
    const negRate = s.mentions ? s.neg / s.mentions : 0;
    const reliable = s.eM >= 3 && s.lM >= 3;
    const delta = reliable ? s.lN / s.lM - s.eN / s.eM : 0;
    const imp = clamp((importance[meta.id] ?? meta.importance) / 5);
    const crit = { freq: maxMentions ? s.mentions / maxMentions : 0, neg: negRate, trend: clamp(delta / 0.5), imp };
    const score = s.mentions ? Math.round(100 * (w.freq * crit.freq + w.neg * crit.neg + w.trend * crit.trend + w.imp * crit.imp)) : 0;
    const themes = [...s.themes.values()].sort((a, b) => b.count - a.count).map((th) => ({
      ...th,
      rec: meta.themes.find((t) => t.label === th.label)?.rec || 'Tinjau komentar terkait dan tetapkan tindakan perbaikan bersama Panitia.',
    }));
    return {
      id: meta.id, label: meta.label, description: meta.description,
      mentions: s.mentions, pos: s.pos, neu: s.neu, neg: s.neg,
      share: total ? s.mentions / total : 0, negRate,
      trend: { reliable, delta, early: s.eM ? s.eN / s.eM : null, late: s.lM ? s.lN / s.lM : null },
      importance: importance[meta.id] ?? meta.importance,
      criteria: crit, score, level: levelOf(score, s.mentions), lowSample: s.mentions > 0 && s.mentions < 3,
      themes, topTheme: themes[0] || null,
    };
  }).sort((a, b) => b.score - a.score || b.mentions - a.mentions);

  const themesAll = aspects.flatMap((a) => a.themes.map((t) => ({ ...t, aspectId: a.id, aspectLabel: a.label }))).sort((a, b) => b.count - a.count).slice(0, 8);
  const mentionTotal = aspects.reduce((n, a) => n + a.mentions, 0);
  const negTotal = aspects.reduce((n, a) => n + a.neg, 0);

  return {
    total, withAspect, unclassified: total - withAspect, mentionTotal, negTotal,
    negShare: mentionTotal ? negTotal / mentionTotal : 0,
    aspects, themesAll, splitDate, weights: w,
  };
}

function parseCsv(text, delim) {
  const rows = [];
  let row = [];
  let cell = '';
  let q = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i += 1; } else q = false; } else cell += c;
    } else if (c === '"') q = true;
    else if (c === delim) { row.push(cell); cell = ''; }
    else if (c === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; }
    else if (c !== '\r') cell += c;
  }
  if (cell.length || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim() !== ''));
}

export function parseDate(v) {
  if (!v) return null;
  const s = String(v).trim();
  let y; let m; let d;
  let mt = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (mt) { [, y, m, d] = mt; } else {
    mt = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
    if (mt) { [, d, m, y] = mt; } else return null;
  }
  y = Number(y); m = Number(m); d = Number(d);
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 2000 || y > 2100) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

const TEXT_COLS = ['komentar', 'comment', 'text', 'teks', 'ulasan', 'tanggapan', 'isi', 'feedback', 'review', 'pesan'];
const DATE_COLS = ['tanggal', 'date', 'waktu', 'tgl', 'created_at', 'timestamp'];
const SRC_COLS = ['sumber', 'source', 'channel', 'platform', 'kanal'];
const MAX_ROWS = 5000;

export function parseTable(raw) {
  const text = String(raw).replace(/^\uFEFF/, '');
  const first = text.split(/\r?\n/, 1)[0] || '';
  const count = (ch) => first.split(ch).length - 1;
  const delim = count(';') > count(',') ? ';' : count('\t') > count(',') ? '\t' : ',';
  const table = parseCsv(text, delim);
  if (table.length < 2) return { rows: [], error: 'File kosong atau hanya berisi header.' };
  const head = table[0].map((h) => h.trim().toLowerCase());
  const find = (names) => head.findIndex((h) => names.includes(h));
  const ti = find(TEXT_COLS);
  if (ti < 0) return { rows: [], error: 'Kolom komentar tidak ditemukan. Gunakan header: komentar, tanggal, sumber.' };
  const di = find(DATE_COLS);
  const si = find(SRC_COLS);
  const rows = [];
  let badDates = 0;
  for (let i = 1; i < table.length && rows.length < MAX_ROWS; i += 1) {
    const t = (table[i][ti] || '').trim();
    if (!t) continue;
    const date = di >= 0 ? parseDate(table[i][di]) : null;
    if (di >= 0 && table[i][di] && !date) badDates += 1;
    rows.push({ id: rows.length + 1, text: t, date, source: si >= 0 ? (table[i][si] || '').trim() || '-' : '-' });
  }
  const truncated = table.length - 1 > MAX_ROWS;
  const notes = [];
  if (badDates) notes.push(`${badDates} tanggal tidak terbaca (gunakan format YYYY-MM-DD atau DD/MM/YYYY).`);
  if (truncated) notes.push(`Hanya ${MAX_ROWS} baris pertama yang dipakai.`);
  if (di < 0) notes.push('Kolom tanggal tidak ada, sehingga tren dan filter waktu tidak aktif.');
  return { rows, error: null, notes };
}

export const CSV_TEMPLATE = 'komentar,tanggal,sumber\n"Pendaftaran online mudah tapi verifikasi berkas lama",2026-10-12,Instagram\n"Admin ramah dan cepat membalas WhatsApp",2026-10-13,WhatsApp\n"Biaya kuliah mahal, rinciannya tidak jelas",2026-10-14,Survei\n';

export function toCsv(columns, rows) {
  const q = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [columns.map(q).join(','), ...rows.map((r) => r.map(q).join(','))].join('\r\n');
}

const pick = (o, names) => {
  for (const n of names) if (o && o[n] != null && o[n] !== '') return o[n];
  const keys = Object.keys(o || {});
  for (const n of names) { const k = keys.find((x) => x.toLowerCase() === n); if (k && o[k] != null && o[k] !== '') return o[k]; }
  return null;
};

function toIsoDate(v) {
  if (v == null || v === '') return null;
  if (typeof v === 'object') {
    if (typeof v.toDate === 'function') return toIsoDate(v.toDate());
    if (v instanceof Date) return Number.isNaN(v.getTime()) ? null : `${v.getFullYear()}-${String(v.getMonth() + 1).padStart(2, '0')}-${String(v.getDate()).padStart(2, '0')}`;
    if (typeof v.seconds === 'number') return toIsoDate(new Date(v.seconds * 1000));
    return null;
  }
  if (typeof v === 'number') return toIsoDate(new Date(v < 1e12 ? v * 1000 : v));
  return parseDate(v);
}

const LABEL_COLS = ['sentimen', 'sentiment', 'label', 'predicted_label', 'prediction', 'prediksi', 'label_sentimen', 'sentiment_label'];
const DATE_HINTS = ['tanggal', 'tgl', 'date', 'waktu', 'time', 'created', 'posted', 'publish', 'timestamp', 'datetime'];
const LABEL_MAP = { positif: 'positif', positive: 'positif', pos: 'positif', netral: 'netral', neutral: 'netral', neu: 'netral', negatif: 'negatif', negative: 'negatif', neg: 'negatif' };

function findByHint(o, hints, accept) {
  for (const k of Object.keys(o || {})) {
    const lk = k.toLowerCase();
    if (hints.some((h) => lk.includes(h))) { const r = accept(o[k]); if (r) return r; }
  }
  return null;
}

export function normalizeDatasetRows(docs) {
  const out = [];
  for (const d of docs || []) {
    let text = pick(d, [...TEXT_COLS, 'komentar_asli', 'clean_text', 'cleaned_text', 'text_clean', 'content', 'body', 'caption', 'comment_text', 'komentar_bersih']);
    if (!text) {
      let best = '';
      for (const v of Object.values(d || {})) if (typeof v === 'string' && v.length > best.length) best = v;
      text = best.length >= 15 ? best : null;
    }
    if (!text || !String(text).trim()) continue;
    const src = pick(d, SRC_COLS);
    const rawDate = pick(d, [...DATE_COLS, 'tanggal_komentar', 'date_posted', 'posted_at', 'created', 'datetime']);
    const date = toIsoDate(rawDate) || findByHint(d, DATE_HINTS, toIsoDate);
    const rawLabel = pick(d, LABEL_COLS);
    const label = rawLabel != null ? LABEL_MAP[String(rawLabel).trim().toLowerCase()] || null : null;
    out.push({ id: out.length + 1, text: String(text).trim(), date, source: src ? String(src).trim() : '-', label });
  }
  return out;
}
