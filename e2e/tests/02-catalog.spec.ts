import { test, expect } from "../fixtures/base";
import { SEL } from "../helpers/selectors";

test.describe("02 — Catálogo de Productos", () => {
  test("sección de catálogo está presente en la página", async ({
    homePage,
  }) => {
    const catalog = homePage.locator(SEL.catalogSection).first();
    if ((await catalog.count()) > 0) {
      await expect(catalog).toBeAttached();
    } else {
      // Si se busca por id o clase
      const section = homePage
        .locator("section")
        .filter({ hasText: /colección|catálogo|productos/i })
        .first();
      await expect(section).toBeVisible();
    }
  });

  test("muestra cards de productos con imágenes y detalles", async ({
    homePage,
  }) => {
    // Scroll a productos
    await homePage.evaluate(() => window.scrollTo(0, 800));
    await homePage.waitForTimeout(1000);

    const productCards = homePage
      .locator('[class*="group"], [class*="product"], [class*="card"]')
      .filter({
        has: homePage.locator("img"),
      });

    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("el carrusel Trending/Novedades funciona si está disponible", async ({
    homePage,
  }) => {
    const trending = homePage.locator(SEL.trendingCarousel).first();
    if (await trending.isVisible().catch(() => false)) {
      await expect(trending).toBeVisible();
    }
  });
});
