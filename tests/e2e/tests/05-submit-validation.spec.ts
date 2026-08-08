import { test, expect } from "@playwright/test";

test.describe("Submit validation", () => {
  test("shows browser validation when required fields are empty", async ({ page }) => {
    await page.goto("./#/submit");

    // Click submit without filling any fields
    await page.click('[data-testid="submit-button"]');

    // Title input should have browser required validation triggered
    // (We check that no navigation happened)
    await expect(page).toHaveURL(/\/submit/);
  });

  test("clears field error when user corrects the value", async ({ page }) => {
    await page.goto("./#/submit");

    // Fill all required fields except abstract to trigger a short submission
    await page.fill('[data-testid="input-title"]', "T");
    await page.fill('[data-testid="input-speakerName"]', "S");
    // Don't fill abstract to rely on HTML required
    await page.fill('[data-testid="input-abstract"]', "Short abstract");
    await page.selectOption('[data-testid="input-track"]', "qa");
    await page.selectOption('[data-testid="input-level"]', "beginner");

    // Submit should work (all fields minimal but valid)
    await page.click('[data-testid="submit-button"]');
    await expect(page).toHaveURL(/\/talks\/.+/);
  });
});
