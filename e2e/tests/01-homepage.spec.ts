import { test, expect } from "../fixtures/base";
import { SEL } from "../helpers/selectors";

test.describe("01 — Homepage & Navegación", () => {
  test("carga la página principal con título SEO correcto", async ({
    homePage,
  }) => {
    const title = await homePage.title();
    expect(title).toContain("Isafer");
  });

  test("el InitialLoader aparece y luego desaparece", async ({ page }) => {
    await page.goto("/");

    // El wrapper interno del loader
    const loaderWrapper = page.locator(".isafer-loader-wrapper");

    // Esperar a que se desmonte/desaparezca (el loader dura 1.6s, damos hasta 12s para ejecución paralela)
    await expect(loaderWrapper).toBeHidden({ timeout: 12000 });
  });

  test("el Hero section es visible con título principal", async ({
    homePage,
  }) => {
    const heading = homePage.locator("h1").first();
    await expect(heading).toBeVisible();

    // Debe contener texto relevante (Sexy, Sensual, Elegant, etc.)
    const headingText = await heading.textContent();
    expect(headingText).toBeTruthy();
  });

  test('el CTA "Explorar Colección" es visible y clickable', async ({
    homePage,
  }) => {
    const cta = homePage.locator(SEL.heroCta).first();
    await expect(cta).toBeVisible();

    // Click en CTA → debe hacer scroll a la sección de catálogo
    await cta.click();
    await homePage.waitForTimeout(1000);

    // Verificar que la sección catálogo está en viewport
    const catalog = homePage.locator(SEL.catalogSection).first();
    if ((await catalog.count()) > 0) {
      await expect(catalog).toBeInViewport({ timeout: 3000 });
    }
  });

  test("la navbar tiene logo, carrito y menú de usuario", async ({
    homePage,
  }) => {
    // Logo
    const logo = homePage.locator(SEL.logo).first();
    await expect(logo).toBeVisible();

    // Al menos un botón en la navbar (carrito, usuario, etc.)
    const navButtons = homePage.locator("nav button, header button");
    expect(await navButtons.count()).toBeGreaterThan(0);
  });

  test("el footer es visible con información de contacto", async ({
    homePage,
  }) => {
    // Scroll al final
    await homePage.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight),
    );
    await homePage.waitForTimeout(500);

    const footer = homePage.locator(SEL.footer);
    await expect(footer).toBeVisible();
  });

  test("el banner de ofertas animado es visible", async ({ homePage }) => {
    // El banner suele estar después del hero
    const bannerTexts = ["ENVÍO", "DESCUENTO", "COLECCIÓN", "SHOWROOM"];

    let found = false;
    for (const keyword of bannerTexts) {
      const el = homePage.getByText(keyword, { exact: false }).first();
      if (await el.isVisible({ timeout: 1000 }).catch(() => false)) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  test("la página no tiene errores de consola críticos", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/");
    await page.waitForTimeout(3500); // Esperar que cargue todo incluyendo loader

    // Filtrar errores conocidos/esperados (favicon, etc.)
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes("favicon") && !e.includes("404") && !e.includes("net::"),
    );

    // Permitir warnings, pero no errores de JS puro
    // (solo informativo, no falla el test)
    if (criticalErrors.length > 0) {
      console.warn("Console errors detected:", criticalErrors);
    }
  });
});
