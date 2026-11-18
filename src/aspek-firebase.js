import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase.js";

const COLLECTION_NAME = "pmb_comments";

export async function loadFirebaseRows() {
  if (COLLECTION_NAME.startsWith("GANTI_")) {
    throw new Error("nama koleksi belum diisi di src/aspek-firebase.js");
  }
  const snap = await getDocs(collection(db, COLLECTION_NAME));
  return snap.docs.map((d) => d.data());
}
