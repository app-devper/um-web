# User Management Web

Web console สำหรับระบบ User Management (UM) ใช้สำหรับจัดการผู้ใช้ สิทธิ์การเข้าถึง และ systems ต่าง ๆ เชื่อมต่อกับ [`um-api`](../um-api) ผ่าน REST

## Features

- **Authentication** — เข้าสู่ระบบด้วย username/password และเก็บ access token ใน `sessionStorage`
- **User Management** — สร้าง / แก้ไข / ลบ ผู้ใช้ รวมถึงเปลี่ยนสถานะ สิทธิ์ ตั้งรหัสผ่าน และ unlock บัญชีที่ถูกล็อก
- **System Management** — จัดการรายการ system (สำหรับสิทธิ์ `SUPER` เท่านั้น)
- **Profile** — แก้ไขข้อมูลส่วนตัว เปลี่ยนรหัสผ่าน ดู active sessions และ sign out จากอุปกรณ์อื่นได้ ใช้ได้กับทุก role รวม `USER`
- **Role-based routing** — หลัง login: `USER` → `/profile`, `ADMIN`/`SUPER` → `/users` พร้อมเมนูและสิทธิ์ที่กรองตาม role
- **SSO handoff** — รองรับการ login ข้ามระบบผ่านหน้า `/sso` (ดู [SSO Handoff Flow](#sso-handoff-flow) ด้านล่าง)
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

   > **จำเป็น** — ถ้าไม่ได้ตั้งค่า `NEXT_PUBLIC_API_URL` ระบบจะ throw error ตั้งแต่ build time เพื่อกันการ deploy production โดยชี้ไป localhost โดยไม่ตั้งใจ

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
│   │   │   ├── page.tsx       # Home → redirect ตาม role
│   │   │   ├── profile/       # หน้าแก้ไขโปรไฟล์ของตัวเอง (ทุก role)
│   │   │   ├── systems/       # จัดการ system (SUPER only)
│   │   │   └── users/         # จัดการผู้ใช้ (SUPER, ADMIN)
│   │   ├── login/             # หน้า login
│   │   ├── sso/               # SSO handoff — แลก ticket เป็น token
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

1. ผู้ใช้กรอก username, password และ system code บนหน้า `/login`
2. เรียก `POST /auth/login` ที่ `um-api` → ได้ `accessToken`
3. เก็บ token ไว้ใน `sessionStorage` แล้ว redirect ตาม role: `USER` → `/profile`, `ADMIN` / `SUPER` → `/users`
4. ทุก request ต่อจากนี้ Axios interceptor ([src/lib/api.ts](src/lib/api.ts)) จะแนบ `Authorization: Bearer <token>` ให้อัตโนมัติ
5. `AuthProvider` ([src/lib/auth.tsx](src/lib/auth.tsx)) จะ `keep-alive` ทุก 4 นาที เพื่อต่ออายุ token
6. ถ้า API ตอบ `401` จะลบ token แล้ว redirect กลับไปหน้า `/login`

## SSO Handoff Flow

รองรับกรณีที่ผู้ใช้ล็อกอินอยู่ใน front-end อื่นที่ใช้ `um-api` เดียวกัน (เช่น `dpharm.web.app`) แล้วต้องการเข้ามาดู/แก้ไขโปรไฟล์ใน um-web โดยไม่ต้อง login ใหม่

```
[front-end อื่น]                                 [um-api]                        [um-web]
  กดปุ่ม Profile
  → POST /auth/sso-ticket (Bearer token เดิม) ──▶
                                                  issue ticket (TTL 60s)
                                              ◀── { ticket }
  redirect → /sso?ticket=xxx&return=/profile ──────────────────────────────▶ /sso/page.tsx
                                                                              → POST /auth/exchange { ticket }
                                              ◀──────────────────────────── um-api consume ticket
                                                                              (GETDEL) + ออก JWT ใหม่
                                              ──── { accessToken } ────────▶ เก็บใน sessionStorage
                                                                              → redirect ไป return URL
```

สิ่งที่หน้า `/sso` ทำ ([src/app/sso/page.tsx](src/app/sso/page.tsx)):
1. อ่าน `?ticket=<uuid>` และ `?return=<path>` (default `/profile`) จาก URL
2. เรียก `POST /auth/exchange` ด้วย ticket
3. เก็บ `accessToken` ใน `sessionStorage` แล้ว hard-redirect ไป `return` เพื่อให้ `AuthProvider` โหลด user ใหม่
4. ถ้า ticket หมดอายุ / ใช้ซ้ำ → แสดงหน้า "Sign-in failed" พร้อมปุ่มกลับไป `/login`

ตัวอย่างการเรียกจาก front-end ต้นทาง:

```ts
const { data } = await api.post<{ ticket: string }>("/auth/sso-ticket");
window.location.href = `https://devper-um.web.app/sso?ticket=${data.ticket}&return=/profile`;
```

## Related

- Backend API: [`um-api`](../um-api) — Go + Gin + MongoDB + Redis
