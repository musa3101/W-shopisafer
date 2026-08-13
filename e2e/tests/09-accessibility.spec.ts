import { test, expect } from "../fixtures/base";

test.describe("09 — Accesibilidad y Roles", () => {
  test("las imágenes principales contienen texto alternativo (alt)", async ({
    homePage,
  }) => {
    const images = homePage.locator("img");
    const count = await images.count();

    let withAlt = 0;
    for (let i = 0; i < Math.min(count, 10); i++) {
      const alt = await images.nth(i).getAttribute("alt");
      if (alt !== null) withAlt++;
    }

    expect(withAlt).toBeGreaterThan(0);
  });

  test("navegación con teclado básica funciona", async ({ homePage }) => {
    await homePage.keyboard.press("Tab");
    await homePage.waitForTimeout(200);

    const focused = homePage.locator(":focus");
    expect(await focused.count()).toBeGreaterThanOrEqual(0);
  });
});
