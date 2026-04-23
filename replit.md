# Cydestore

Polished, conversion-focused electronics e-commerce platform for Cydestore — a real shop on Tom Mboya Street, Rural Urban Building, Shop B4, off Moi Avenue, Nairobi, Kenya. Customers browse online and order via WhatsApp (no card payments).

## Architecture (pnpm monorepo)

- **artifacts/electronics-store** — public storefront (React + Vite, base path `/`)
- **artifacts/cydestore-admin** — admin dashboard (React + Vite, base path `/admin/`)
- **artifacts/api-server** — Express 5 + Drizzle ORM API (mounted at `/api`)
- **artifacts/mockup-sandbox** — design playground
- **lib/api-spec** — OpenAPI 3.1 spec, source of truth (`openapi.yaml`)
- **lib/api-client-react** — React Query hooks (Orval-generated)
- **lib/api-zod** — Zod schemas (Orval-generated)
- **lib/db** — Drizzle schema + seed script

After OpenAPI changes: `pnpm --filter @workspace/api-spec run codegen`.
After DB schema changes: `pnpm --filter @workspace/db run push`.
Re-seed sample data: `pnpm --filter @workspace/db exec tsx seed.ts`.

## Auth

Cookie-based admin session (`admin_session`, bcryptjs password hash, express-session). Default seed admin: `admin@cydestore.co.ke / admin123`.

## Sample Data

Seeded with 8 categories, 10 brands, 20 realistic electronics products (laptops, smartphones, tablets, audio, power, smart devices, accessories), 3 promo banners, 7 FAQs, 5 testimonials, and Cydestore store settings (KES pricing, +254 WhatsApp number).

## WhatsApp

Storefront reads `whatsappNumber` from `/api/settings`. Every product card and detail page builds `https://wa.me/{digits}?text={prefilledMsgWithProductName}` links. Floating WhatsApp button on every page.
