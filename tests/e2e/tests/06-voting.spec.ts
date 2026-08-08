import { test, expect } from "@playwright/test";

test.describe("Voting", () => {
  test("vote button increments vote count", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("article");

    // Open the first talk
    await page.locator("article").first().locator("a[href*='/talks/']").last().click();
    await page.waitForURL(/\/talks\/.+/);

    const countEl = page.locator('[data-testid="vote-count"]');
    const before = parseInt(await countEl.textContent() || "0");

    await page.click('[data-testid="vote-button"]');

    // After voting button should change and count should increase
    await expect(page.locator('[data-testid="vote-button"]')).toContainText("Already voted");
    const after = parseInt(await countEl.textContent() || "0");
    expect(after).toBe(before + 1);
  });

  test("vote button is disabled after voting (within same session)", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("article");

    await page.locator("article").first().locator("a[href*='/talks/']").last().click();
    await page.waitForURL(/\/talks\/.+/);

    await page.click('[data-testid="vote-button"]');
    await expect(page.locator('[data-testid="vote-button"]')).toBeDisabled();
  });

  test("reload page still shows Already voted state", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("article");

    await page.locator("article").first().locator("a[href*='/talks/']").last().click();
    await page.waitForURL(/\/talks\/.+/);
    const url = page.url();

    await page.click('[data-testid="vote-button"]');
    await expect(page.locator('[data-testid="vote-button"]')).toContainText("Already voted");

    // Reload — localStorage persists
    await page.goto(url);
    await expect(page.locator('[data-testid="vote-button"]')).toContainText("Already voted");
  });
});
