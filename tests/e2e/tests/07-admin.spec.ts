import { test, expect } from "@playwright/test";

test.describe("Admin panel", () => {
  test("admin page shows submitted talks", async ({ page }) => {
    await page.goto("./#/admin");
    await expect(page.locator("h1")).toContainText("Admin");

    // Should have at least one submitted talk from seed data
    const rows = page.locator('[data-testid^="admin-talk-"]');
    await expect(rows).not.toHaveCount(0);
  });

  test("approving a talk removes it from admin queue", async ({ page }) => {
    await page.goto("./#/admin");
    await page.waitForSelector('[data-testid^="admin-talk-"]');

    const beforeCount = await page.locator('[data-testid^="admin-talk-"]').count();
    await page.locator('[data-testid^="approve-"]').first().click();

    // Wait for removal
    await page.waitForTimeout(500);
    const afterCount = await page.locator('[data-testid^="admin-talk-"]').count();
    expect(afterCount).toBe(beforeCount - 1);
  });

  test("approved talk appears as approved in the main list", async ({ page }) => {
    // Submit a new talk to have a fresh one
    await page.goto("./#/submit");
    const title = `Admin Approve Test ${Date.now()}`;
    await page.fill('[data-testid="input-title"]', title);
    await page.fill('[data-testid="input-speakerName"]', "Admin Tester");
    await page.fill('[data-testid="input-abstract"]', "Testing admin approval flow end to end.");
    await page.selectOption('[data-testid="input-track"]', "devops");
    await page.selectOption('[data-testid="input-level"]', "intermediate");
    await page.click('[data-testid="submit-button"]');
    await page.waitForURL(/\/talks\/.+/);

    // Go to admin, approve it
    await page.goto("./#/admin");
    await page.waitForSelector(`text=${title}`);
    // Click Approve on the row containing this talk's title
    const talkRow = page.locator('[data-testid^="admin-talk-"]', { hasText: title });
    await talkRow.locator('[data-testid^="approve-"]').click();
    await page.waitForTimeout(300);

    // Check that talk is no longer in admin queue
    await expect(page.locator(`text=${title}`)).not.toBeVisible();

    // Go to main list, filter by approved, check it's there
    await page.goto("./");
    await page.waitForSelector("article");
    await page.selectOption('[data-testid="filter-status"]', "approved");
    await page.waitForTimeout(300);
    await expect(page.locator(`text=${title}`)).toBeVisible();
  });
});
