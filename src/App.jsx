import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "./firebase.js";
import AppShell from "./components/AppShell.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SentimentMonitoring from "./pages/SentimentMonitoring.jsx";
import Dataset from "./pages/Dataset.jsx";
import InsightExport from "./pages/InsightExport.jsx";
import AspectPriority from "./pages/AspectPriority.jsx";
import HelpManual from "./pages/HelpManual.jsx";

export default function App() {
  const [user, setUser] = useState(undefined);
  const [logoutError, setLogoutError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  async function handleLogout() {
    setLogoutError("");
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Firebase logout failed:", error);
      setLogoutError("Logout gagal. Periksa koneksi, lalu coba lagi.");
    }
  }

  if (user === undefined) {
    return (
      <div className="auth-loading" role="status" aria-live="polite">
        Memeriksa sesi masuk…
      </div>
    );
  }

  return (
    <>
      {logoutError && (
        <div className="global-error" role="alert">
          {logoutError}
          <button type="button" onClick={() => setLogoutError("")}>Tutup</button>
        </div>
      )}
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          element={
            user
              ? <AppShell user={user} onLogout={handleLogout} />
              : <Navigate to="/login" replace />
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/monitoring" element={<SentimentMonitoring />} />
          <Route path="/dataset" element={<Dataset />} />
          <Route path="/insight-export" element={<InsightExport />} />
          <Route path="/aspect-priority" element={<AspectPriority />} />
          <Route path="/help" element={<HelpManual />} />
        </Route>
        <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
      </Routes>
    </>
  );
}
