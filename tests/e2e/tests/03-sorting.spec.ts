import { test, expect } from "@playwright/test";

test.describe("Sorting", () => {
  test("sorted by votes shows highest-voted talk first", async ({ page }) => {
    await page.goto("./");
    await page.waitForSelector("article");

    // Default sort is by votes (highest first)
    await page.selectOption('[data-testid="sort-select"]', "votes");
    await page.waitForTimeout(300);

    // Collect vote counts from visible cards
    const voteBadges = page.locator("article span[style*='font-weight: 700']");
    const texts = await voteBadges.allTextContents();
    const votes = texts.map(Number).filter((n) => !isNaN(n));

    // Votes should be in descending order
    for (let i = 0; i < votes.length - 1; i++) {
      expect(votes[i]).toBeGreaterThanOrEqual(votes[i + 1]);
    }
  });
});
