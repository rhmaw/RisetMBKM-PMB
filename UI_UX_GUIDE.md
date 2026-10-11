# AMIKOM PMB Insight — UI/UX & handoff guide

## Arah desain

Antarmuka menggunakan pendekatan dashboard institusional yang tenang: latar netral, permukaan putih, border tipis, tipografi yang mudah dibaca, dan ungu sebagai aksen navigasi/aksi utama. Warna status hanya digunakan untuk membantu pemindaian; bukan sebagai dekorasi. Hindari menambah gradient, glow, badge berlebihan, kartu metrik berulang, atau istilah teknis tanpa penjelasan.

## Prinsip saat meneruskan pengembangan

1. **Utamakan kejelasan.** Gunakan Bahasa Indonesia untuk label yang terlihat pengguna. Istilah seperti confidence, precision, recall, ABSA, atau skor prioritas perlu diberi penjelasan singkat ketika pertama kali ditampilkan.
2. **Bedakan data nyata dan contoh.** Data dummy harus tetap diberi label contoh. Jangan menghapus catatan prototipe sebelum sumber data/model benar-benar terhubung.
3. **Jangan memberi kesan real-time palsu.** Status lokal harus disebut lokal. Firebase belum terhubung pada paket ini.
4. **Gunakan satu sistem gaya.** `src/styles.css` memuat navigasi, halaman umum, formulir, tabel, notifikasi, dan fondasi desain. `src/pages/AspectPriority.css` memuat komponen spesifik halaman aspek. Gunakan kembali `.panel`, `.btn`, `.field`, `.notice`, dan token warna sebelum membuat gaya baru.
5. **Jaga responsivitas.** Pada layar kecil, sidebar berubah menjadi menu, tabel boleh digulir horizontal, matriks harus tetap terbaca, dan dialog tidak boleh terpotong.
6. **Sediakan state antarmuka.** Untuk data nyata, setiap komponen data perlu memiliki kondisi memuat, kosong, berhasil, dan gagal. Jangan menampilkan angka nol jika data belum selesai dimuat.

## Perilaku yang sudah ada

- Login lokal demo: `admin` / `admin` (bukan autentikasi produksi).
- CSV diimpor secara merge, duplikat dilewati, dan data disimpan dalam `localStorage` browser.
- Filter di halaman Pemantauan Sentimen hanya mengubah tabel di halaman itu.
- Halaman Aspek & Prioritas memakai `src/data/aspectPriorityDemoData.js`. Filter periode/sumber/aspek, matriks, KPI ilustratif, tabel, panel detail, ekspor CSV contoh, dan dialog placeholder bekerja pada data dummy.
- Rentang waktu pada Aspek & Prioritas belum aktif karena agregat contoh belum berisi tanggal.
- Firebase Auth, Firestore, API model IndoBERT/ABSA, evaluasi model, dan sistem tiket belum terhubung.

## Checklist sebelum rilis

- [ ] Ganti seluruh data dummy dengan data dari API/Firestore yang sudah tervalidasi.
- [ ] Pastikan perhitungan metrik dan skor prioritas ditentukan secara eksplisit dan ditinjau tim.
- [ ] Tampilkan periode, versi model, sumber data, dan tanggal pembaruan dari backend jika tersedia.
- [ ] Pastikan label angka, denominator persentase, nilai kosong, dan timezone tanggal konsisten.
- [ ] Pasang Firebase Authentication dan aturan akses Firestore sebelum menghapus keterangan prototipe.
- [ ] Tambahkan pengujian untuk impor CSV, deduplikasi, filter, ekspor, state kosong, dan tampilan seluler.
- [ ] Jalankan `npm run build` di proyek React sebelum merge.
