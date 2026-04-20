# User Management Web

Web console สำหรับระบบ User Management (UM) ใช้สำหรับจัดการผู้ใช้ สิทธิ์การเข้าถึง และ systems ต่าง ๆ เชื่อมต่อกับ [`um-api`](../um-api) ผ่าน REST

## Features

- **Authentication** — เข้าสู่ระบบด้วย username/password ตาม system code และเก็บ access token ใน `sessionStorage`
- **User Management** — สร้าง / แก้ไข / ลบ ผู้ใช้ รวมถึงเปลี่ยนสถานะ สิทธิ์ และตั้งรหัสผ่านใหม่
- **System Management** — จัดการรายการ system (สำหรับสิทธิ์ `SUPER` เท่านั้น)
- **Profile** — แก้ไขข้อมูลส่วนตัวและเปลี่ยนรหัสผ่านของผู้ใช้ที่ล็อกอินอยู่
- **Role-based UI** — แสดงเมนูและการดำเนินการตามสิทธิ์ (`SUPER` / `ADMIN` / `USER`)
- **Static Export** — Build เป็น static site สำหรับ deploy บน Firebase Hosting

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, static export, React Compiler)
- [React 19](https://react.dev)
- [TypeScript 5](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com) (new-york style) + [Radix UI](https://www.radix-ui.com)
- [Axios](https://axios-http.com) — HTTP client
- [Sonner](https://sonner.emilkowal.ski) — Toast notifications
- [next-themes](https://github.com/pacocoursey/next-themes) — Dark mode
- [lucide-react](https://lucide.dev) — Icon library

## Prerequisites

- Node.js 20 ขึ้นไป
- npm / yarn / pnpm / bun อย่างใดอย่างหนึ่ง
- Backend [`um-api`](../um-api) ที่รันอยู่ (หรือ URL ที่เข้าถึงได้)
- Firebase CLI (ถ้าต้องการ deploy) — `npm install -g firebase-tools`

## Setup

1. ติดตั้ง dependencies

   ```bash
   npm install
   ```

2. สร้างไฟล์ `.env.development.local` ที่ root ของโปรเจกต์

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8585/api/um/v1
   ```

   สำหรับ production ให้สร้าง `.env.production`

   ```env
   NEXT_PUBLIC_API_URL=https://<your-api-host>/api/um/v1
   ```

   > ถ้าไม่ได้ตั้งค่า `NEXT_PUBLIC_API_URL` จะ fallback ไปที่ `http://localhost:8585/api/um/v1`

## Run

```bash
# Development server (http://localhost:3000)
npm run dev

# Production build (static export ออกที่โฟลเดอร์ out/)
npm run build

# รัน build output แบบ local
npm run start

# Lint
npm run lint
```

## Deploy

โปรเจกต์ตั้งค่าสำหรับ deploy ขึ้น Firebase Hosting (site: `devper-um`) — ดูการตั้งค่าใน [`firebase.json`](firebase.json) และ [`.firebaserc`](.firebaserc)

```bash
# Build static export ก่อน
npm run build

# Deploy ไป Firebase Hosting
firebase deploy --only hosting:devper-um
```

## Project Structure

```
um-web/
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Protected routes (ต้องล็อกอิน)
│   │   │   ├── layout.tsx     # Dashboard layout (sidebar + topbar)
│   │   │   ├── page.tsx       # Home
│   │   │   ├── profile/       # หน้าแก้ไขโปรไฟล์ของตัวเอง
│   │   │   ├── systems/       # จัดการ system (SUPER only)
│   │   │   └── users/         # จัดการผู้ใช้ (SUPER, ADMIN)
│   │   ├── login/             # หน้า login
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Redirect ไป login / dashboard
│   │   └── globals.css        # Tailwind + theme variables
│   ├── components/
│   │   ├── ui/                # shadcn/ui primitives
│   │   ├── sidebar.tsx        # Navigation sidebar
│   │   ├── topbar.tsx         # Top navigation bar
│   │   ├── confirm-dialog.tsx # Confirmation dialog
│   │   ├── user-form-dialog.tsx
│   │   └── system-form-dialog.tsx
│   ├── lib/
│   │   ├── api.ts             # Axios instance + interceptors
│   │   ├── auth.tsx           # Auth context / provider
│   │   └── utils.ts           # cn() helper ฯลฯ
│   └── types/
│       └── index.ts           # TypeScript interfaces (User, System, ...)
├── public/                    # Static assets
├── out/                       # Static export (generated)
├── components.json            # shadcn/ui config
├── next.config.ts             # Next.js config (output: "export")
├── firebase.json              # Firebase Hosting config
├── tsconfig.json
└── package.json
```

## Authentication Flow

1. ผู้ใช้กรอก username, password และเลือก system บนหน้า `/login`
2. เรียก `POST /auth/login` ที่ `um-api` → ได้ `accessToken`
3. เก็บ token ไว้ใน `sessionStorage` แล้ว redirect เข้า `(dashboard)`
4. ทุก request ต่อจากนี้ Axios interceptor ([src/lib/api.ts](src/lib/api.ts)) จะแนบ `Authorization: Bearer <token>` ให้อัตโนมัติ
5. ถ้า API ตอบ `401` จะลบ token แล้ว redirect กลับไปหน้า `/login`

## Related

- Backend API: [`um-api`](../um-api) — Go + Gin + MongoDB + Redis
