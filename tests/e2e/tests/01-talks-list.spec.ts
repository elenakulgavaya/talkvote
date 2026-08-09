import { test, expect } from "@playwright/test";

test.describe("Talks list", () => {
  test("displays talks list with seed data", async ({ page }) => {
    await page.goto("./");
    await expect(page.locator("h1")).toContainText("TalkVote");
    await page.waitForSelector("article");
    const cards = page.locator("article");
    expect(await cards.count()).toBeGreaterThanOrEqual(8);
  });

  test("shows talk title, speaker name and vote count on each card", async ({ page }) => {
    await page.goto("./");
    const firstCard = page.locator("article").first();
    await expect(firstCard.locator("h2")).not.toBeEmpty();
    await expect(firstCard).toContainText("by");
    await expect(firstCard).toContainText("👍");
  });

  test("navigate to submit page via button", async ({ page }) => {
    await page.goto("./");
    await page.click("text=Submit a talk");
    await expect(page).toHaveURL(/\/submit/);
  });
});
