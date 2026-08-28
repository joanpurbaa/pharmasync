TIM: nama tim kamu

Anggota: 
- Sabita Humaira | Ketua
- Djob Misael | Anggota 1

Pharmasync adalah platform dashboard Supply Chain Management (SCM) medis terintegrasi yang dirancang untuk mengoptimalkan pengelolaan persediaan obat dan rantai pasok klinis secara real time, transparan, dan efisien.

## Solusi yang Ditawarkan
Pharmasync hadir untuk mengatasi permasalahan manajemen logistik farmasi seperti ketidaktepatan perencanaan, risiko kekosongan obat (stock out), penumpukan stok (overstock), hingga medication error melalui platform berbasis web modern dan responsif.

## Fitur Utama
Visualisasi Gudang 3D Imersif: Memantau tata letak fisik rak dan lokasi persediaan obat secara visual menggunakan Three.js & React Three Fiber.

Color Coded Stock Warning: Peringatan stok berbasis indikator warna instan (Aman, Menipis, Kritis) untuk cegah kelangkaan obat.

Live Map Tracking: Pemantauan rute dan armada pengiriman logistik secara real time berbasis Leaflet.

Integrasi Chatbot Telegram AI: Asisten percakapan berbasis AI (NLP) untuk kueri cepat data persediaan dan pengiriman via perangkat seluler.

Multi Role Access: Antarmuka disesuaikan khusus untuk Admin Gudang/Farmasi dan Kurir/Driver Logistik.

## Tech Stack
Frontend: Next.js (App Router, TypeScript), Tailwind CSS, Shadcn UI, Zustand

3D & Maps: Three.js / React Three Fiber, Leaflet

Backend & DB: Supabase, PostgreSQL, Prisma ORM, Redis

AI & Integration: Gemini 3.5 Flash, GLM 5.2, Telegram Webhook
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
