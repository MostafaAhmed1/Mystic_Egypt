# Mystic Egypt Tourism Platform

Custom-built tourism booking platform for a UK-registered company with a local team in Egypt. Targets upper-economy tourists from Europe and Eastern Europe with a seamless, secure, GDPR-compliant booking experience and a powerful admin panel.

## Tech Stack

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Database:** MariaDB via Prisma 7
- **Auth:** NextAuth.js + OTP (Resend)
- **State:** TanStack Query (server) + Zustand (client)
- **UI:** shadcn/ui (Base UI) + Tailwind CSS
- **Maps:** Leaflet + OpenStreetMap (free, no API key)
- **Payments:** Stripe Elements (PCI-DSS)
- **i18n:** i18next / react-i18next (en, ar, de)

## Getting Started

```bash
npm install
cp .env.example .env   # then fill in real values
npx prisma db push     # create schema
npx prisma db seed     # seed admin + sample tours
npm run dev
```

Open http://localhost:3000

## Useful Scripts

```bash
npm run dev          # development server
npm run build        # production build
npm run start        # production server
npm run lint         # ESLint
npm run db:push      # push Prisma schema to DB
npm run db:migrate   # create/apply migrations
npm run db:seed      # run seed script
```

## Documentation

- `docs/PRD.md` — Product Requirements Document (source of truth)
- `AGENTS.md` — Project rules and protocols
- `EXECUTION_PLAN.md` — Phased execution plan
- `PROJECT_MAP.md` — Living project map & status tracker
- `MANUAL_STEPS.md` — Human-required actions & keys
