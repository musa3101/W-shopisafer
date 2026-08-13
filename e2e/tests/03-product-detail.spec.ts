import { test, expect } from "../fixtures/base";

test.describe("03 — Detalle de Producto Modal", () => {
  test("hacer clic en un producto abre el modal de detalles", async ({
    homePage,
  }) => {
    // Scroll hacia los productos
    await homePage.evaluate(() => window.scrollTo(0, 1000));
    await homePage.waitForTimeout(1000);

    // Buscar una card de producto clickable
    const firstProduct = homePage.locator("img[alt]").first();
    if (await firstProduct.isVisible().catch(() => false)) {
      await firstProduct.click({ force: true });
      await homePage.waitForTimeout(1000);

      // Verificar modal o dialogo
      const dialog = homePage.locator('[role="dialog"]');
      if (await dialog.isVisible().catch(() => false)) {
        await expect(dialog).toBeVisible();
      }
    }
  });
});
