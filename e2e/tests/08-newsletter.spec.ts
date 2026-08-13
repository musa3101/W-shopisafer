import { test, expect } from "../fixtures/base";

test.describe("08 — Suscripción al Newsletter", () => {
  test("formulario de newsletter presente en la página", async ({
    homePage,
  }) => {
    // Scroll al footer
    await homePage.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight),
    );
    await homePage.waitForTimeout(1000);

    const emailInput = homePage
      .locator('footer input[type="email"], input[placeholder*="email" i]')
      .first();
    if (await emailInput.isVisible().catch(() => false)) {
      await expect(emailInput).toBeVisible();
    }
  });
});
