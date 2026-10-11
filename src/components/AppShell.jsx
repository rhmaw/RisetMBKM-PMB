import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Activity, BookOpen, Database, Download, Home, LogOut, Menu, Target, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { to: "/", label: "Beranda", icon: Home, end: true },
  { to: "/monitoring", label: "Pemantauan Sentimen", icon: Activity },
  { to: "/aspect-priority", label: "Aspek & Prioritas", icon: Target },
  { to: "/dataset", label: "Dataset", icon: Database },
  { to: "/insight-export", label: "Laporan & Ekspor", icon: Download },
  { to: "/help", label: "Panduan", icon: BookOpen },
];

const names = {
  "/": "Beranda",
  "/monitoring": "Pemantauan Sentimen",
  "/aspect-priority": "Aspek & Prioritas",
  "/dataset": "Dataset",
  "/insight-export": "Laporan & Ekspor",
  "/help": "Panduan",
};

export default function AppShell({ onLogout, user }) {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const title = names[loc.pathname] || "Beranda";

  useEffect(() => setOpen(false), [loc.pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="app-layout">
      {open && <button className="scrim" onClick={() => setOpen(false)} aria-label="Tutup navigasi" />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`} aria-label="Navigasi utama">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">A</div>
          <div className="brand-copy">
            <span>AMIKOM PURWOKERTO</span>
            <strong>PMB Insight</strong>
          </div>
          <button className="sidebar-close" onClick={() => setOpen(false)} aria-label="Tutup navigasi"><X size={18} /></button>
        </div>
        <div className="nav-caption">RUANG KERJA</div>
        <nav className="side-nav">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
              <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="workspace-note">
            <span className="workspace-note-icon"><Database size={15} /></span>
            <div><strong>Mode prototipe</strong><span>Data disimpan di browser ini</span></div>
          </div>
          <button className="logout-link" onClick={onLogout}><LogOut size={16} strokeWidth={1.8} /> Keluar</button>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Buka navigasi"><Menu size={20} /></button>
          <div className="topbar-title-group">
            <div className="breadcrumb"><span>RUANG KERJA</span><span className="breadcrumb-separator">/</span><strong>{title}</strong></div>
            <h1>{title}</h1>
          </div>
          <div className="topbar-meta">
            <span className="environment-pill"><i /> Firebase Authentication</span>
            <div className="topbar-user" aria-label="Pengguna saat ini">
              <div className="admin-avatar">A</div>
              <div className="admin-copy"><strong>{user?.email?.split("@")[0] || "Admin"}</strong><span>Akun Firebase</span></div>
            </div>
          </div>
        </header>
        <main className="page-content"><Outlet /></main>
        <footer className="app-footer"><span>PMB INSIGHT</span><span className="footer-dot">·</span> Login Firebase aktif <span className="footer-note">Dataset belum disinkronkan ke cloud</span></footer>
      </div>
    </div>
  );
}
