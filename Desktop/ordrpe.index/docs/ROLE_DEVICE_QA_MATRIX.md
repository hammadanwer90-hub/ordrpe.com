# OrdrPe Role + Device QA Matrix

Use this checklist before every production release.

## Test Setup

- Devices:
  - Phone: iPhone 12/13 or Android Pixel viewport
  - Tablet: iPad / 768px width
  - Desktop: 1280px+ width
- Browsers:
  - Chrome (required)
  - Safari (recommended)
- Accounts:
  - 1 admin account
  - 1 vendor account (active subscription)
  - 1 vendor account (inactive subscription)
  - 1 customer account

## 1) Global UX and Navigation (All Devices)

- [ ] Open `/` as guest
  - Expected: Home renders without broken layout, no overflow, nav visible.
- [ ] Check nav links (`Admin`, `Vendor`, `Account`, `In Stock`)
  - Expected: Clickable, no overlap/cut text on phone.
- [ ] Check user badge after login
  - Expected: role/email visible; long text truncates cleanly on small screens.
- [ ] Theme + language toggle on home
  - Expected: Toggle works and persists across refresh.
- [ ] Scroll all home sections
  - Expected: Animations are smooth, no jitter, spacing is consistent.

## 2) Auth Flow (Guest -> Logged In)

- [ ] Go to `/login` and sign up as customer
  - Expected: Account creation succeeds; routed to customer area.
- [ ] Sign out from `/logout`
  - Expected: Redirects to `/login`, session removed.
- [ ] Sign in with wrong password
  - Expected: Clear error shown, no crash.
- [ ] Sign in with valid credentials
  - Expected: Redirects based on role:
    - admin -> `/admin`
    - vendor -> `/vendor`
    - customer -> `/account`

## 3) RBAC / Route Protection

- [ ] Guest opens `/admin`, `/vendor`, `/account`
  - Expected: Redirected to `/login`.
- [ ] Customer opens `/admin` and `/vendor`
  - Expected: Redirected away (home or allowed page), no privileged data shown.
- [ ] Vendor opens `/admin`
  - Expected: Redirected away.
- [ ] Inactive vendor opens `/vendor/products`
  - Expected: Redirected to `/vendor/subscription`.

## 4) Storefront and In-Stock (Customer-facing)

- [ ] Open `/` and `/instock`
  - Expected: Product cards render, filters visible.
- [ ] Click country/category filters
  - Expected: URL query updates; list updates correctly.
- [ ] Click hero/category tiles that deep-link to in-stock
  - Expected: Route opens with expected filters.
- [ ] Click `Buy Now` while logged out
  - Expected: Redirect to `/login`.
- [ ] Click `Buy Now` as customer
  - Expected: Order is created (visible in customer orders).
- [ ] Click `Buy Now` as vendor/admin
  - Expected: Redirect to `/account` (no invalid order creation).

## 5) Customer Portal

- [ ] Open `/account`
  - Expected: Dashboard links visible and responsive.
- [ ] Open `/account/orders`
  - Expected: Orders list visible; tracking timeline displayed.
- [ ] Delivered order review submit with image
  - Expected: Upload succeeds; review stored; no layout break on mobile.
- [ ] Open `/account/preorders` and submit request
  - Expected: Request appears in list; status shown.
- [ ] Empty state checks (new customer)
  - Expected: Friendly empty-state cards appear, no blank pages.

## 6) Vendor Portal

- [ ] Open `/vendor`
  - Expected: Vendor dashboard links visible.
- [ ] Open `/vendor/products` and add product with stock > 0
  - Expected: Insert succeeds, product appears in list.
- [ ] Verify product appears on `/instock` (if approved + active subscription)
  - Expected: Visible in storefront.
- [ ] Open `/vendor/orders`, update shipment note + status action
  - Expected: Update persists.
- [ ] Open `/vendor/wallet`, submit withdrawal request
  - Expected: Request appears in history.
- [ ] Empty state checks
  - Expected: Clear no-data messages, no broken UI.

## 7) Admin Portal

- [ ] Open `/admin`
  - Expected: All admin module links visible.
- [ ] `/admin/orders`: change status + manual note
  - Expected: Persists and appears in customer tracking timeline.
- [ ] `/admin/vendors`: toggle subscription active/inactive
  - Expected: Vendor access/storefront visibility updates accordingly.
- [ ] `/admin/preorders`: broadcast request
  - Expected: Broadcast inserts and pre-order status updates.
- [ ] `/admin/finance`: approve pending withdrawal
  - Expected: Request status changes and vendor balance updates.
- [ ] `/admin/reviews`: approve/reject review
  - Expected: Verification state updates.
- [ ] Empty state checks
  - Expected: Informative no-data cards appear.

## 8) Responsive QA Gates

- [ ] Phone (320-430px):
  - No horizontal scroll.
  - Buttons tap-friendly.
  - Forms usable without overlap.
- [ ] Tablet (768-1024px):
  - Card grids align correctly.
  - Section spacing balanced.
- [ ] Desktop (1280px+):
  - Visual hierarchy clean.
  - No giant whitespace gaps.

## 9) Final Release Gate

- [ ] `npm run build` passes.
- [ ] Supabase env vars present in deployment.
- [ ] All critical flows above pass on at least 1 phone, 1 tablet, 1 desktop.
- [ ] Admin, Vendor, Customer all can login and complete core tasks.

If any item fails, fix and rerun only impacted sections plus RBAC checks.
