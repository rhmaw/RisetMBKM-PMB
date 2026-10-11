import { useState } from "react";
import { Activity, ArrowRight, Database, ShieldCheck } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";

const ADMIN_USERNAME = "admin";
const ADMIN_EMAIL = import.meta.env.VITE_FIREBASE_ADMIN_EMAIL?.trim();

const authMessages = {
  "auth/invalid-credential": "Username atau password tidak sesuai.",
  "auth/invalid-login-credentials": "Username atau password tidak sesuai.",
  "auth/user-not-found": "Akun admin belum dibuat di Firebase Authentication.",
  "auth/wrong-password": "Username atau password tidak sesuai.",
  "auth/user-disabled": "Akun admin sedang dinonaktifkan.",
  "auth/too-many-requests": "Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.",
  "auth/network-request-failed": "Koneksi internet bermasalah. Periksa koneksi lalu coba lagi.",
  "auth/operation-not-allowed": "Email/Password belum diaktifkan di Firebase Authentication.",
};

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (username.trim().toLowerCase() !== ADMIN_USERNAME) {
      setError("Username tidak dikenal.");
      return;
    }
    if (!ADMIN_EMAIL || !ADMIN_EMAIL.includes("@")) {
      setError("Email admin belum dikonfigurasi. Periksa VITE_FIREBASE_ADMIN_EMAIL di .env.local.");
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
    } catch (err) {
      console.error("Firebase sign-in failed:", err.code || err.message);
      setError(authMessages[err.code] || "Login gagal. Periksa konfigurasi Firebase dan akun admin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <section className="login-hero">
        <div className="hero-brand">
          <div className="brand-mark brand-mark-light" aria-hidden="true">A</div>
          <span>UNIVERSITAS AMIKOM PURWOKERTO</span>
        </div>
        <div className="hero-content">
          <div className="hero-kicker">PENERIMAAN MAHASISWA BARU</div>
          <h1>Memahami suara calon mahasiswa.</h1>
          <p>PMB Insight membantu tim melihat pola komentar, memantau sentimen, dan meninjau masukan secara lebih terstruktur.</p>
          <div className="hero-feature-list">
            <div><Activity size={17} /><span>Ringkasan sentimen dari data komentar</span></div>
            <div><Database size={17} /><span>Impor dan pemeriksaan dataset</span></div>
            <div><ShieldCheck size={17} /><span>Ruang kerja untuk evaluasi internal</span></div>
          </div>
        </div>
        <div className="hero-footnote">Login terlindungi · Firebase Authentication</div>
      </section>

      <section className="login-panel">
        <form className="login-form" onSubmit={submit}>
          <div className="login-mini-mark" aria-hidden="true">A</div>
          <div className="eyebrow">AKSES ADMINISTRATOR</div>
          <h2>Masuk ke PMB Insight</h2>
          <p>Gunakan akun administrator untuk membuka ruang kerja.</p>

          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Masukkan username"
            required
            disabled={loading}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Masukkan password"
            required
            disabled={loading}
          />

          {error && <div className="form-error" role="alert">{error}</div>}

          <button className="btn btn-primary login-submit" type="submit" disabled={loading}>
            {loading ? "Memeriksa akun…" : "Masuk"}
            <ArrowRight size={17} />
          </button>
          <div className="demo-warning">Akun dibuat oleh administrator. Pendaftaran akun publik tidak tersedia.</div>
        </form>
      </section>
    </div>
  );
}
