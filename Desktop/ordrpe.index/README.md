# OrdrPe Multi-Vendor Marketplace

Next.js + Supabase marketplace scaffold for international sourcing vendors selling to Pakistan.

## Setup

1. Copy `.env.example` to `.env.local` and fill Supabase keys.
2. Run SQL migrations in Supabase (in order):
   - `supabase/migrations/20260423000000_ordrpe_marketplace.sql`
   - `supabase/migrations/20260423010000_tracking_reviews.sql`
   - `supabase/migrations/20260423013000_orders_add_product_id.sql`
   - `supabase/migrations/20260423020000_review_storage.sql`
   - `supabase/migrations/20260424010000_profiles_self_onboarding_policy.sql`
   - `supabase/migrations/20260424013000_activate_existing_vendors.sql`
3. (Optional) Seed demo users/data:
   - Create auth users: `admin@ordrpe.com`, `vendor@ordrpe.com`, `customer@ordrpe.com`
   - Run: `supabase/seed/seed_demo_data.sql`
   - For production bootstrap only (no demo commerce data), run:
     - `supabase/seed/seed_production_bootstrap.sql`
   - To promote an existing auth user to admin by email, run:
     - `supabase/seed/promote_admin_by_email.sql`
4. Start app:
   - `npm install`
   - `npm run dev`
5. (Optional) Bootstrap first admin account from app:
   - Set `ORDRPE_ADMIN_BOOTSTRAP_TOKEN` in environment variables.
   - Open `/setup/admin-user`
   - Enter admin email/password and the bootstrap token.
   - Login at `/login` and you will be routed to `/admin`.

## Included in this scaffold

- RBAC route protection for `/admin`, `/vendor`, and `/account`.
- Supabase schema for profiles, products, orders, pre-orders, broadcasts, and withdrawals.
- Commission and escrow release logic at database level.
- Storefront product listing with category + origin country filters.
- Admin pre-order broadcast screen with anonymized vendor broadcasts.
- Photo review upload + admin review verification flow.
- Persistent theme/language preference controls on homepage.

## Operations

- Go-live checklist: `docs/GO_LIVE_CHECKLIST.md`
- Role/device QA matrix: `docs/ROLE_DEVICE_QA_MATRIX.md`

## E2E Smoke Tests (Playwright)

- Install browsers (first run only):
  - `npx playwright install`
- Run smoke suite:
  - `npm run test:e2e`
- Run headed mode locally:
  - `npm run test:e2e:headed`

Optional authenticated role tests can be enabled with env vars:

- `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`
- `E2E_VENDOR_EMAIL`, `E2E_VENDOR_PASSWORD`
- `E2E_CUSTOMER_EMAIL`, `E2E_CUSTOMER_PASSWORD`

## GitHub -> Supabase Auto Migrations

This repo now includes `.github/workflows/supabase-migrate.yml` which runs on:
- push to `main` when `supabase/migrations/**` changes
- manual trigger (`workflow_dispatch`)

Set these GitHub Actions repository secrets before using it:
- `SUPABASE_PROJECT_REF` (from Supabase project URL/ref)
- `SUPABASE_DB_PASSWORD` (database password for your Supabase project)

After secrets are set, push a migration commit to `main` (or run workflow manually) and GitHub will apply migrations with `supabase db push`.

## CI Guardrails

This repo includes `.github/workflows/ci.yml`:
- Runs on push to `main` and pull requests
- Installs dependencies and runs `npm run build`

The migration workflow also has a CI gate and only pushes DB migrations if build checks pass.

## GitHub -> Vercel Deploy

This repo includes `.github/workflows/vercel-deploy.yml`:
- Runs on push to `main` and manual dispatch
- Builds in CI, then deploys to Vercel production

Required GitHub Actions repository secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
