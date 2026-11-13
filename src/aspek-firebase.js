import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase.js";

// GANTI dengan nama koleksi Firestore yang berisi komentar dataset PMB.
// Cara mencari: di VS Code tekan Ctrl+Shift+F lalu cari  collection(
const COLLECTION_NAME = "pmb_comments";

/** Mengambil seluruh dokumen dataset dari Firestore. */
export async function loadFirebaseRows() {
  if (COLLECTION_NAME.startsWith("GANTI_")) {
    throw new Error("nama koleksi belum diisi di src/aspek-firebase.js");
  }
  const snap = await getDocs(collection(db, COLLECTION_NAME));
  return snap.docs.map((d) => d.data());
}
