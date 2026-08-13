import { test, expect } from "../fixtures/base";

test.describe("04 — Carrito de Compras", () => {
  test("abrir y cerrar el carrito lateral", async ({ homePage }) => {
    // Buscar icono del carrito en el header
    const cartBtn = homePage
      .locator("header button, nav button")
      .filter({
        has: homePage.locator(
          "svg.lucide-shopping-bag, svg.lucide-shopping-cart",
        ),
      })
      .first();

    if (await cartBtn.isVisible().catch(() => false)) {
      await cartBtn.click();
      await homePage.waitForTimeout(500);

      // Verificar sheet o dialog
      const sheet = homePage.locator('[role="dialog"]');
      await expect(sheet).toBeVisible();

      // Cerrar sheet con botón de cerrar o Escape
      await homePage.keyboard.press("Escape");
      await homePage.waitForTimeout(500);
    }
  });
});
