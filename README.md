# Broker Web

## Requirements

- Bun
- Node.js ที่รองรับ Next.js 16
- Backend API ที่รันอยู่ เช่น `http://localhost:3030/api/web`

## Install

ติดตั้ง dependencies:

```bash
bun install
```

## Environment

สร้างหรือแก้ไฟล์ `.env` ที่ root ของโปรเจกต์:

```env
NEXT_PUBLIC_API_URL=http://localhost:3030/api/web
```

ตัวแปรนี้ต้องขึ้นต้นด้วย `NEXT_PUBLIC_` เพราะ frontend เรียก API จาก client component

## Run Development

รัน frontend:

```bash
bun run dev
```

เปิดเว็บ:

```txt
http://localhost:3000
```

ถ้าต้องการใช้ port อื่น:

```bash
bun run dev -- -p 3001
```

## Backend API

frontend คาดหวัง API ตาม path เหล่านี้ภายใต้ `NEXT_PUBLIC_API_URL`:

```txt
GET  /health
POST /auth/register
POST /auth/login
GET  /brokers
GET  /brokers/:slug
POST /brokers
```

ตัวอย่าง base URL:

```txt
http://localhost:3030/api/web
```

ดังนั้น endpoint เต็มจะเป็น:

```txt
http://localhost:3030/api/web/auth/login
http://localhost:3030/api/web/brokers
```

## Auth Flow

- Login เรียก `POST /auth/login`
- response ต้องมี `access_token`
- token ถูกเก็บใน `localStorage` และ cookie ชื่อ `broker-web-token`
- Next.js `proxy.ts` ใช้ cookie เพื่อตรวจว่าเข้า protected route ได้หรือไม่
- request ไป broker API จะส่ง header:

```txt
Authorization: Bearer <access_token>
```

## Routes

```txt
/                 Broker list
/login            Login
/register         Register
/create           Create broker
/broker/[slug]    Broker detail
```

protected routes:

```txt
/
/create
/broker/[slug]
```

ถ้าไม่มี token จะถูก redirect ไป `/login`

## Scripts

ตรวจ lint:

```bash
bun run lint
```

build production:

```bash
bun run build
```

run production หลัง build:

```bash
bun run start
```
