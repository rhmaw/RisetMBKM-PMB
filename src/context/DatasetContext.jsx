import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Papa from "papaparse";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";
import { auth, db } from "../firebase.js";
import { parseFlexibleDate } from "../utils/date.js";

const Ctx = createContext(null);
const LOCAL_STORAGE_KEY = "amikom_pmb_dataset_manual_test_v2";
const COLLECTION_NAME = "pmb_comments";
const BATCH_SIZE = 450;

const headerKey = (value) => String(value ?? "")
  .replace(/^\uFEFF/, "")
  .toLowerCase()
  .replace(/[^a-z0-9]/g, "");

const pick = (row, keys, fallback = "") => {
  const entries = Object.entries(row || {});
  for (const wanted of keys) {
    const target = headerKey(wanted);
    const found = entries.find(([key, value]) =>
      headerKey(key) === target && value !== undefined && value !== null && String(value).trim() !== ""
    );
    if (found) return found[1];
  }
  return fallback;
};

export function normalizeRow(row, index = 0) {
  const source = String(pick(row, ["source", "Platform", "platform", "social_platform"], "Import")).trim() || "Import";
  const comment = String(pick(row, [
    "text_raw", "Komentar", "comment", "text", "teks", "comment_text", "Comment Text",
    "text_clean", "full_text", "message", "isi_komentar",
  ], "")).trim();
  const date = String(pick(row, [
    "date", "Tanggal", "datetime", "timestamp", "createTimeISO", "created_at", "createdAt",
    "created_time", "created_time_utc", "published_at", "post_date", "comment_date",
    "date_of_comment", "date_time", "time", "tgl", "waktu", "Waktu Komentar",
    "Tanggal Komentar", "tanggaljam", "Tanggal & Jam", "tanggal posting", "tanggal_dan_jam",
    "tanggal_dan_waktu",
  ], "")).trim();
  const username = String(pick(row, ["username", "author_username", "ownerUsername", "uniqueId", "author", "user", "nama_pengguna"], "—")).trim() || "—";
  const rawLabel = String(pick(row, [
    "prediction_label", "Label", "label", "Label Manual", "Sentimen", "sentiment",
    "true_label_name", "true_label", "sentiment_label", "predicted_label", "label_prediksi", "hasil_sentimen",
  ], "Neutral")).trim().toLowerCase();
  const label = (rawLabel.includes("positive") || rawLabel.includes("positif"))
    ? "Positive"
    : (rawLabel.includes("negative") || rawLabel.includes("negatif")) ? "Negative" : "Neutral";
  const confidenceText = String(pick(row, ["confidence", "Confidence", "score"], 0)).trim();
  const confidenceNumber = Number(confidenceText.replace(/%$/, ""));
  const confidence = Number.isFinite(confidenceNumber)
    ? Math.max(0, Math.min(1, confidenceText.endsWith("%") ? confidenceNumber / 100 : confidenceNumber > 1 ? confidenceNumber / 100 : confidenceNumber))
    : 0;
  const post_url = String(pick(row, ["post_url", "Post/Video URL", "postUrl", "videoWebUrl", "url", "link_post"], "")).trim();
  const explicitCommentId = String(pick(row, ["comment_id", "Comment ID", "cid", "commentId"], "")).trim();
  const genericId = String(pick(row, ["id"], "")).trim();
  // UI-generated ids such as row-12-... are not platform comment IDs.
  const comment_id = explicitCommentId || (genericId.startsWith("row-") ? "" : genericId);
  return {
    id: comment_id || `row-${index}-${source}-${date}-${username}`,
    comment_id,
    source,
    date,
    username,
    comment,
    label,
    confidence,
    post_url,
  };
}

const normalizedText = (value) => String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
const normalizedSource = (value) => String(value || "").toLowerCase().trim();

const sameDate = (a, b) => {
  const dateA = parseFlexibleDate(a);
  const dateB = parseFlexibleDate(b);
  // A missing/legacy date should match the same comment so its date can be repaired.
  if (!dateA || !dateB) return true;
  return Math.abs(dateA.getTime() - dateB.getTime()) < 1000;
};

const rowKey = (row) => {
  const source = normalizedSource(row.source);
  const commentId = String(row.comment_id || "").trim();
  if (commentId) return `${source}|id:${commentId}`;
  return `${source}|${String(row.date || "").trim()}|${normalizedText(row.username)}|${normalizedText(row.comment)}`;
};

function mergeRowArrays(existingRows, incomingRows) {
  const merged = existingRows.map((row) => ({ ...row }));
  let added = 0;
  let duplicates = 0;
  let updated = 0;

  for (let i = 0; i < incomingRows.length; i += 1) {
    const row = normalizeRow(incomingRows[i], merged.length + i);
    if (!row.comment) continue;

    const foundIndex = merged.findIndex((existing) => {
      if (normalizedSource(existing.source) !== normalizedSource(row.source)) return false;
      const existingId = String(existing.comment_id || "").trim();
      const incomingId = String(row.comment_id || "").trim();
      if (existingId && incomingId) return existingId === incomingId;
      if (normalizedText(existing.username) !== normalizedText(row.username)) return false;
      if (normalizedText(existing.comment) !== normalizedText(row.comment)) return false;
      return sameDate(existing.date, row.date);
    });

    if (foundIndex >= 0) {
      const existing = merged[foundIndex];
      const existingDate = parseFlexibleDate(existing.date);
      const incomingDate = parseFlexibleDate(row.date);
      let changed = false;
      if (!existingDate && incomingDate) {
        existing.date = row.date;
        changed = true;
      }
      if (!existing.comment_id && row.comment_id) {
        existing.comment_id = row.comment_id;
        changed = true;
      }
      if (!existing.post_url && row.post_url) {
        existing.post_url = row.post_url;
        changed = true;
      }
      if (changed) updated += 1;
      else duplicates += 1;
      continue;
    }

    merged.push(row);
    added += 1;
  }

  return { rows: merged, added, duplicates, updated };
}

// Stable, deterministic document IDs so repeating a sync updates the same documents.
// This is an identity hash, not a security mechanism.
function stableDocumentId(row) {
  const input = rowKey(row);
  let h1 = 0x811c9dc5;
  let h2 = 0x9e3779b9;
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 0x01000193);
    h2 = Math.imul(h2 ^ (code + i), 0x85ebca6b);
  }
  const a = (h1 >>> 0).toString(16).padStart(8, "0");
  const b = (h2 >>> 0).toString(16).padStart(8, "0");
  return `row_${a}${b}`;
}

function cloudDocumentToRow(data) {
  // Return raw fields; mergeRowArrays normalizes each row exactly once.
  return data;
}

export function DatasetProvider({ children }) {
  const [rows, setRows] = useState([]);
  const rowsRef = useRef([]);
  const [ready, setReady] = useState(false);
  const [sourceName, setSourceName] = useState("Dataset kosong — siap impor manual");
  const [cloudState, setCloudState] = useState({
    status: "checking",
    message: "Memeriksa sesi Firebase…",
    cloudCount: 0,
  });
  const cloudCountRef = useRef(0);

  const commitLocalRows = useCallback((nextRows, nextSourceName) => {
    rowsRef.current = nextRows;
    setRows(nextRows);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(nextRows));
    } catch (error) {
      console.error("Gagal menyimpan cache dataset lokal:", error);
    }
    if (nextSourceName) setSourceName(nextSourceName);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          rowsRef.current = parsed;
          setRows(parsed);
          setSourceName(parsed.length ? "Dataset lokal (browser)" : "Dataset kosong — siap impor manual");
          setReady(true);
          return;
        }
      }
    } catch (error) {
      console.warn("Gagal membaca dataset lokal:", error?.message || error);
    }
    rowsRef.current = [];
    setRows([]);
    setSourceName("Dataset kosong — siap impor manual");
    setReady(true);
  }, []);

  const mergeRows = useCallback((incoming, fileName = "CSV impor") => {
    const incomingWithComments = incoming.filter((row) =>
      String(pick(row, ["text_raw", "Komentar", "comment", "text", "teks", "comment_text", "Comment Text", "text_clean", "full_text", "message", "isi_komentar"], "")).trim()
    );
    const result = mergeRowArrays(rowsRef.current, incomingWithComments);
    commitLocalRows(result.rows, "Dataset lokal (browser) — perubahan belum disinkronkan");
    return { ...result, fileName, total: result.rows.length };
  }, [commitLocalRows]);

  const importCsvFile = useCallback(async (file) => {
    const parsed = Papa.parse(await file.text(), {
      header: true,
      skipEmptyLines: "greedy",
      transformHeader: (header) => header.replace(/^\uFEFF/, "").trim(),
    });
    const parserError = parsed.errors?.find((error) => error.type !== "FieldMismatch");
    if (parserError) throw new Error(parserError.message);
    return mergeRows(parsed.data, file.name);
  }, [mergeRows]);

  const refreshFromCloud = useCallback(async () => {
    if (!auth.currentUser) throw new Error("Sesi Firebase tidak ditemukan. Silakan login ulang.");
    setCloudState({ status: "loading", message: "Mengambil dataset dari Firestore…", cloudCount: cloudCountRef.current });
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));
    const cloudRows = snapshot.docs.map((document) => cloudDocumentToRow(document.data()));
    const merged = mergeRowArrays(rowsRef.current, cloudRows);
    cloudCountRef.current = snapshot.size;
    const label = snapshot.size
      ? `Dataset gabungan (browser + Firebase; ${snapshot.size.toLocaleString("id-ID")} dokumen cloud)`
      : (merged.rows.length ? "Dataset lokal (browser) — belum dikirim ke Firebase" : "Dataset kosong — siap impor manual");
    commitLocalRows(merged.rows, label);
    setCloudState({
      status: "connected",
      message: snapshot.size
        ? `Firebase terhubung. ${snapshot.size.toLocaleString("id-ID")} dokumen ditemukan di cloud; data cloud digabung dengan data lokal.`
        : "Firebase terhubung, tetapi koleksi cloud masih kosong. Dataset lokal tidak dihapus; gunakan Sinkronkan ke Firebase untuk mengirimnya.",
      cloudCount: snapshot.size,
    });
    return { cloudCount: snapshot.size, total: merged.rows.length, ...merged };
  }, [commitLocalRows]);

  const syncToCloud = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Kamu belum login ke Firebase. Silakan login ulang.");

    setCloudState({ status: "syncing", message: "Menggabungkan dataset lokal dan cloud…", cloudCount: cloudCountRef.current });

    const collectionRef = collection(db, COLLECTION_NAME);
    const snapshot = await getDocs(collectionRef);
    const cloudRows = snapshot.docs.map((document) => cloudDocumentToRow(document.data()));
    const merged = mergeRowArrays(rowsRef.current, cloudRows);
    const allRows = merged.rows;

    // Firestore write batches are capped below the 500-operation limit.
    for (let start = 0; start < allRows.length; start += BATCH_SIZE) {
      const batch = writeBatch(db);
      const chunk = allRows.slice(start, start + BATCH_SIZE);
      for (const row of chunk) {
        const ref = doc(collectionRef, stableDocumentId(row));
        batch.set(ref, {
          ...row,
          rowKey: rowKey(row),
          ownerUid: user.uid,
          schemaVersion: 1,
          updatedAt: serverTimestamp(),
        }, { merge: true });
      }
      await batch.commit();
    }

    // Do not delete remote documents during this first migration; this is intentionally non-destructive.
    const finalLabel = `Cloud Firestore (${allRows.length.toLocaleString("id-ID")} komentar tersinkron)`;
    commitLocalRows(allRows, finalLabel);
    cloudCountRef.current = Math.max(snapshot.size, allRows.length);
    setCloudState({
      status: "connected",
      message: `Sinkronisasi berhasil: ${allRows.length.toLocaleString("id-ID")} komentar tersedia di dataset gabungan. Data lokal dan cloud digabung; tidak ada dokumen cloud yang dihapus.`,
      cloudCount: cloudCountRef.current,
    });
    return { total: allRows.length, localCount: rowsRef.current.length, previousCloudCount: snapshot.size };
  }, [commitLocalRows]);

  // When an authenticated user enters the app, load cloud data and merge it into local cache.
  // Local-only rows are never uploaded automatically; user initiates the first cloud sync explicitly.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setCloudState({ status: "signed-out", message: "Belum login Firebase. Dataset hanya tersimpan di browser ini.", cloudCount: 0 });
        return;
      }
      setCloudState({ status: "loading", message: "Mengambil dataset cloud…", cloudCount: cloudCountRef.current });
      refreshFromCloud().catch((error) => {
        console.error("Gagal memuat dataset Firestore:", error);
        setCloudState({
          status: "error",
          message: "Gagal membaca Firestore. Periksa Security Rules: email akun Firebase harus sama dengan email admin yang diizinkan.",
          cloudCount: cloudCountRef.current,
        });
      });
    });
    return unsubscribe;
  }, [refreshFromCloud]);

  const exportCsv = useCallback(() => {
    const formatDateForExport = (value) => {
      const date = parseFlexibleDate(value);
      if (!date) return String(value ?? "");
      const pad = (part) => String(part).padStart(2, "0");
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };
    const csv = Papa.unparse(rowsRef.current.map((row, index) => ({
      No: index + 1,
      Tanggal: formatDateForExport(row.date),
      Username: row.username,
      Komentar: row.comment,
      Label: row.label,
      Confidence: row.confidence,
      Source: row.source,
      Comment_ID: row.comment_id,
      Post_URL: row.post_url,
    })));
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "dataset_pmb_sentiment_backup.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }, []);

  const value = useMemo(() => ({
    rows,
    ready,
    sourceName,
    total: rows.length,
    importCsvFile,
    mergeRows,
    exportCsv,
    cloudState,
    refreshFromCloud,
    syncToCloud,
  }), [rows, ready, sourceName, importCsvFile, mergeRows, exportCsv, cloudState, refreshFromCloud, syncToCloud]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDataset() {
  const value = useContext(Ctx);
  if (!value) throw new Error("useDataset memerlukan DatasetProvider");
  return value;
}
