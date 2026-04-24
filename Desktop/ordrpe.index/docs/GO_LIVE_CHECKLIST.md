# OrdrPe Go-Live Checklist

## 1) Environment

- [ ] Create `.env.local` from `.env.example`
- [ ] Set:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `ORDRPE_COMMISSION_PERCENT` (optional override)

## 2) Supabase Database + Storage

- [ ] Run migrations in order:
  1. `supabase/migrations/20260423000000_ordrpe_marketplace.sql`
  2. `supabase/migrations/20260423010000_tracking_reviews.sql`
  3. `supabase/migrations/20260423013000_orders_add_product_id.sql`
  4. `supabase/migrations/20260423020000_review_storage.sql`
- [ ] Confirm bucket exists: `review-photos`
- [ ] Confirm RLS enabled on all app tables

## 3) Auth Bootstrap

- [ ] In Supabase Auth, create initial users:
  - [ ] `admin@ordrpe.com`
  - [ ] `vendor@ordrpe.com`
  - [ ] `customer@ordrpe.com`
- [ ] Choose one seed path:
  - [ ] **Production-safe bootstrap only:** `supabase/seed/seed_production_bootstrap.sql`
  - [ ] **Demo data for testing:** `supabase/seed/seed_demo_data.sql`

## 4) App Validation

- [ ] Install dependencies: `npm install`
- [ ] Build app: `npm run build`
- [ ] Start app: `npm run dev`
- [ ] Validate role routes:
  - [ ] Admin can open `/admin/*`
  - [ ] Vendor can open `/vendor/*`
  - [ ] Customer can open `/account/*`
  - [ ] Unauthorized users are redirected correctly

## 5) Business Flow Smoke Tests

- [ ] Vendor creates product with `stock_qty > 0`
- [ ] Admin approves product
- [ ] Customer places order from storefront
- [ ] Vendor marks order as `At Intl Warehouse`
- [ ] Admin updates status through all milestones to `Delivered`
- [ ] Vendor wallet receives payout only after `Delivered`
- [ ] Customer submits photo review
- [ ] Admin approves review in `/admin/reviews`
- [ ] Customer submits pre-order
- [ ] Admin broadcasts pre-order to active vendors
- [ ] Vendor withdrawal request appears in `/admin/finance`

## 6) Deployment (Vercel)

- [ ] Add all required env vars in Vercel project settings
- [ ] Deploy
- [ ] Add production domain
- [ ] In Supabase Auth -> URL config:
  - [ ] Set Site URL to production domain
  - [ ] Add redirect URLs for local + production
- [ ] Re-run smoke tests on production URL

## 7) Recommended Immediate Hardening

- [ ] Disable public admin signup path in UI
- [ ] Add email/domain allowlist for admin role assignment
- [ ] Add rate limits and bot protection on auth endpoints
- [ ] Add audit logs for admin actions (status changes, withdrawals, role updates)

## 8) GitHub CI for Migrations

- [ ] Add GitHub repository secrets:
  - [ ] `SUPABASE_PROJECT_REF`
  - [ ] `SUPABASE_DB_PASSWORD`
- [ ] Confirm workflow file exists:
  - [ ] `.github/workflows/supabase-migrate.yml`
- [ ] Trigger workflow manually once to validate CI-based migration pipeline

## 9) GitHub CI for Vercel Deploy

- [ ] Add GitHub repository secrets:
  - [ ] `VERCEL_TOKEN`
  - [ ] `VERCEL_ORG_ID`
  - [ ] `VERCEL_PROJECT_ID`
- [ ] Confirm workflow file exists:
  - [ ] `.github/workflows/vercel-deploy.yml`
- [ ] Trigger workflow manually once and verify production deployment URL updates
