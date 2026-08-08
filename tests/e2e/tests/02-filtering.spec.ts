import { test, expect } from "@playwright/test";

const waitForFilter = (page: Parameters<typeof test>[1] extends (args: { page: infer P }) => unknown ? P : never) =>
  page.waitForResponse(r => r.url().includes("/api/talks") && r.status() === 200);

test.describe("Filtering", () => {
  test("filters by track and shows only matching talks", async ({ page }) => {
    await page.goto("./");
    await page.waitForSelector("article");

    const totalCount = await page.locator("article").count();

    await Promise.all([
      waitForFilter(page),
      page.selectOption('[data-testid="filter-track"]', "qa"),
    ]);

    const filteredCount = await page.locator("article").count();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThan(totalCount);

    // Every visible card should show the QA track badge
    const cards = page.locator("article");
    const count = await cards.count();
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toContainText("qa");
    }
  });

  test("filters by level", async ({ page }) => {
    await page.goto("./");
    await page.waitForSelector("article");

    await Promise.all([
      waitForFilter(page),
      page.selectOption('[data-testid="filter-level"]', "beginner"),
    ]);

    const cards = page.locator("article");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toContainText("beginner");
    }
  });

  test("filters by status", async ({ page }) => {
    await page.goto("./");
    await page.waitForSelector("article");

    await Promise.all([
      waitForFilter(page),
      page.selectOption('[data-testid="filter-status"]', "approved"),
    ]);

    const cards = page.locator("article");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      await expect(cards.nth(i)).toContainText("approved");
    }
  });

  test("shows no results message when filters match nothing", async ({ page }) => {
    await page.goto("./");
    await page.waitForSelector("article");

    await Promise.all([
      waitForFilter(page),
      page.selectOption('[data-testid="filter-track"]', "devops"),
    ]);
    await Promise.all([
      waitForFilter(page),
      page.selectOption('[data-testid="filter-level"]', "beginner"),
    ]);

    // devops + beginner has no seed data
    await expect(page.locator("text=No talks found")).toBeVisible();
  });
});
