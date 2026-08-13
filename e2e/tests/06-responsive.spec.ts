import { test, expect } from "../fixtures/base";

test.describe("06 — Adaptabilidad Responsive", () => {
  test("el sitio es navegable en vista móvil", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.waitForTimeout(3000); // Esperar loader

    const body = page.locator("body");
    await expect(body).toBeVisible();

    // Comprobar menú hamburguesa si existe
    const menuBtn = page
      .locator("button")
      .filter({ has: page.locator("svg.lucide-menu") })
      .first();
    if (await menuBtn.isVisible().catch(() => false)) {
      await menuBtn.click();
      await page.waitForTimeout(500);
    }
  });
});
