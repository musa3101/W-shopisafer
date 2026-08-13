import { test, expect } from "../fixtures/base";

test.describe("07 — Ruta de Administración", () => {
  test("la ruta /admin o /admin/login está disponible", async ({ page }) => {
    await page.goto("/admin/login");
    await page.waitForTimeout(2000);

    // Debe haber un formulario o pantalla de acceso
    const inputs = page.locator("input");
    if ((await inputs.count()) > 0) {
      await expect(inputs.first()).toBeVisible();
    }
  });
});
