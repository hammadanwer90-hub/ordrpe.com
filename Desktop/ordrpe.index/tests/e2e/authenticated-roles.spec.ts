import { expect, test, type Page } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const vendorEmail = process.env.E2E_VENDOR_EMAIL;
const vendorPassword = process.env.E2E_VENDOR_PASSWORD;
const customerEmail = process.env.E2E_CUSTOMER_EMAIL;
const customerPassword = process.env.E2E_CUSTOMER_PASSWORD;

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill(password);
  await page.getByRole("button", { name: /login|please wait/i }).click();
}

test.describe("authenticated role routes", () => {
  test.skip(!adminEmail || !adminPassword, "Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD");
  test("admin can access admin dashboard", async ({ page }) => {
    await signIn(page, adminEmail!, adminPassword!);
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: /admin portal/i })).toBeVisible();
  });

  test.skip(!vendorEmail || !vendorPassword, "Set E2E_VENDOR_EMAIL and E2E_VENDOR_PASSWORD");
  test("vendor can access vendor dashboard", async ({ page }) => {
    await signIn(page, vendorEmail!, vendorPassword!);
    await page.goto("/vendor");
    await expect(page.getByRole("heading", { name: /vendor portal/i })).toBeVisible();
  });

  test.skip(!customerEmail || !customerPassword, "Set E2E_CUSTOMER_EMAIL and E2E_CUSTOMER_PASSWORD");
  test("customer can access account dashboard", async ({ page }) => {
    await signIn(page, customerEmail!, customerPassword!);
    await page.goto("/account");
    await expect(page.getByRole("heading", { name: /customer account/i })).toBeVisible();
  });
});
