import { test, expect } from "@playwright/test";

test.describe("Submit talk", () => {
  test("submits a valid talk and redirects to detail page", async ({ page }) => {
    await page.goto("/submit");
    await expect(page.locator("h1")).toContainText("Submit a Talk");

    await page.fill('[data-testid="input-title"]', "E2E Test Talk");
    await page.fill('[data-testid="input-speakerName"]', "Test Speaker");
    await page.fill('[data-testid="input-abstract"]', "This is an abstract for the E2E test talk.");
    await page.selectOption('[data-testid="input-track"]', "qa");
    await page.selectOption('[data-testid="input-level"]', "intermediate");

    await page.click('[data-testid="submit-button"]');

    // Should redirect to detail page of the new talk
    await expect(page).toHaveURL(/\/talks\/.+/);
    await expect(page.locator("h1")).toContainText("E2E Test Talk");
  });

  test("new talk appears on the list with status submitted", async ({ page }) => {
    await page.goto("/submit");

    const uniqueTitle = `Auto Talk ${Date.now()}`;
    await page.fill('[data-testid="input-title"]', uniqueTitle);
    await page.fill('[data-testid="input-speakerName"]', "Auto Speaker");
    await page.fill('[data-testid="input-abstract"]', "Abstract for automated submission test.");
    await page.selectOption('[data-testid="input-track"]', "backend");
    await page.selectOption('[data-testid="input-level"]', "advanced");

    await page.click('[data-testid="submit-button"]');
    await page.waitForURL(/\/talks\/.+/);

    // Go back to list
    await page.goto("/");
    await page.waitForSelector("article");

    await expect(page.locator(`text=${uniqueTitle}`)).toBeVisible();
  });
});
