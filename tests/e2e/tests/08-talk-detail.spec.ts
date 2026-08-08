import { test, expect } from "@playwright/test";

test.describe("Talk detail page", () => {
  test("shows correct title, speaker, abstract, and vote count", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("article");

    const firstCard = page.locator("article").first();
    const titleText = await firstCard.locator("h2").textContent();
    const speakerText = await firstCard.locator("p").first().textContent();

    await firstCard.locator("a[href*='/talks/']").last().click();
    await page.waitForURL(/\/talks\/.+/);

    await expect(page.locator("h1")).toContainText(titleText!.trim());
    await expect(page.locator("p").first()).toContainText(speakerText!.trim().replace("by ", ""));
    await expect(page.locator('[data-testid="vote-count"]')).toBeVisible();
  });

  test("back link returns to list", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("article");

    await page.locator("article").first().locator("a[href*='/talks/']").last().click();
    await page.waitForURL(/\/talks\/.+/);

    await page.click("text=← Back to list");
    await expect(page).toHaveURL(/\/$/);
  });
});
