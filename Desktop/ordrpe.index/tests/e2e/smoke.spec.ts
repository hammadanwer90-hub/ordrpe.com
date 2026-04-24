import { expect, test, type Page } from "@playwright/test";

async function expectAppOrSetup(page: Page, path: string) {
  const url = page.url();
  if (url.includes("/setup")) {
    await expect(page.getByRole("heading", { name: /setup required|supabase setup required/i })).toBeVisible();
    return;
  }
  await expect(page).toHaveURL(new RegExp(path));
}

test.describe("public smoke routes", () => {
  test("home page loads and shows brand", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: /ordrpe/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /in stock/i })).toBeVisible();
  });

  test("in-stock page loads", async ({ page }) => {
    await page.goto("/instock");
    const setupHeading = page.getByRole("heading", {
      name: /setup required|supabase setup required/i
    });
    if (await setupHeading.isVisible().catch(() => false)) {
      await expect(setupHeading).toBeVisible();
    } else {
      await expect(page.getByRole("heading", { name: /browse in stock/i })).toBeVisible();
    }
  });

  test("login page is usable", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /login|create account/i })).toBeVisible();
    await expect(page.getByPlaceholder("Email")).toBeVisible();
    await expect(page.getByPlaceholder("Password")).toBeVisible();
  });
});

test.describe("rbac guest redirects", () => {
  test("guest is redirected from /admin", async ({ page }) => {
    await page.goto("/admin");
    await expectAppOrSetup(page, "/login");
  });

  test("guest is redirected from /vendor", async ({ page }) => {
    await page.goto("/vendor");
    await expectAppOrSetup(page, "/login");
  });

  test("guest is redirected from /account", async ({ page }) => {
    await page.goto("/account");
    await expectAppOrSetup(page, "/login");
  });
});
