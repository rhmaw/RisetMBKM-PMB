# AMIKOM PMB INSIGHT

Dashboard analisis sentimen Penerimaan Mahasiswa Baru
Universitas Amikom Purwokerto.

## Teknologi
- React dan Vite
- Firebase Authentication
- Cloud Firestore
- FastAPI
- IndoBERT

## Menjalankan Frontend
1. Pasang Node.js dan npm.
2. Jalankan npm install.
3. Buat .env.local berdasarkan .env.example.
4. Jalankan npm run dev.

## Backend
Backend menggunakan FastAPI dan model IndoBERT.
Lihat backend/requirements.txt untuk dependensi.
Checkpoint model perlu disiapkan secara terpisah jika
tidak tersedia di repository.

## Pengembangan
Fitur ABSA dikembangkan melalui branch terpisah
dan diintegrasikan melalui Pull Request.






# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
