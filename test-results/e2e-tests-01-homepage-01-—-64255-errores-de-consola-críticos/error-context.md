# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/tests/01-homepage.spec.ts >> 01 — Homepage & Navegación >> la página no tiene errores de consola críticos
- Location: e2e/tests/01-homepage.spec.ts:79:3

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from '../fixtures/base';
  2   | import { SEL } from '../helpers/selectors';
  3   | 
  4   | test.describe('01 — Homepage & Navegación', () => {
  5   | 
  6   |   test('carga la página principal con título SEO correcto', async ({ homePage }) => {
  7   |     const title = await homePage.title();
  8   |     expect(title).toContain('Isafer');
  9   |   });
  10  | 
  11  |   test('el InitialLoader aparece y luego desaparece', async ({ page }) => {
  12  |     await page.goto('/');
  13  |     
  14  |     // El wrapper interno del loader
  15  |     const loaderWrapper = page.locator('.isafer-loader-wrapper');
  16  |     
  17  |     // Esperar a que se desmonte/desaparezca (el loader dura 1.6s, damos hasta 12s para ejecución paralela)
  18  |     await expect(loaderWrapper).toBeHidden({ timeout: 12000 });
  19  |   });
  20  | 
  21  |   test('el Hero section es visible con título principal', async ({ homePage }) => {
  22  |     const heading = homePage.locator('h1').first();
  23  |     await expect(heading).toBeVisible();
  24  |     
  25  |     // Debe contener texto relevante (Sexy, Sensual, Elegant, etc.)
  26  |     const headingText = await heading.textContent();
  27  |     expect(headingText).toBeTruthy();
  28  |   });
  29  | 
  30  |   test('el CTA "Explorar Colección" es visible y clickable', async ({ homePage }) => {
  31  |     const cta = homePage.locator(SEL.heroCta).first();
  32  |     await expect(cta).toBeVisible();
  33  |     
  34  |     // Click en CTA → debe hacer scroll a la sección de catálogo
  35  |     await cta.click();
  36  |     await homePage.waitForTimeout(1000);
  37  |     
  38  |     // Verificar que la sección catálogo está en viewport
  39  |     const catalog = homePage.locator(SEL.catalogSection).first();
  40  |     if (await catalog.count() > 0) {
  41  |       await expect(catalog).toBeInViewport({ timeout: 3000 });
  42  |     }
  43  |   });
  44  | 
  45  |   test('la navbar tiene logo, carrito y menú de usuario', async ({ homePage }) => {
  46  |     // Logo
  47  |     const logo = homePage.locator(SEL.logo).first();
  48  |     await expect(logo).toBeVisible();
  49  |     
  50  |     // Al menos un botón en la navbar (carrito, usuario, etc.)
  51  |     const navButtons = homePage.locator('nav button, header button');
  52  |     expect(await navButtons.count()).toBeGreaterThan(0);
  53  |   });
  54  | 
  55  |   test('el footer es visible con información de contacto', async ({ homePage }) => {
  56  |     // Scroll al final
  57  |     await homePage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  58  |     await homePage.waitForTimeout(500);
  59  |     
  60  |     const footer = homePage.locator(SEL.footer);
  61  |     await expect(footer).toBeVisible();
  62  |   });
  63  | 
  64  |   test('el banner de ofertas animado es visible', async ({ homePage }) => {
  65  |     // El banner suele estar después del hero
  66  |     const bannerTexts = ['ENVÍO', 'DESCUENTO', 'COLECCIÓN', 'SHOWROOM'];
  67  |     
  68  |     let found = false;
  69  |     for (const keyword of bannerTexts) {
  70  |       const el = homePage.getByText(keyword, { exact: false }).first();
  71  |       if (await el.isVisible({ timeout: 1000 }).catch(() => false)) {
  72  |         found = true;
  73  |         break;
  74  |       }
  75  |     }
  76  |     expect(found).toBe(true);
  77  |   });
  78  | 
  79  |   test('la página no tiene errores de consola críticos', async ({ page }) => {
  80  |     const errors: string[] = [];
  81  |     page.on('console', (msg) => {
  82  |       if (msg.type() === 'error') errors.push(msg.text());
  83  |     });
  84  |     
> 85  |     await page.goto('/');
      |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  86  |     await page.waitForTimeout(3500); // Esperar que cargue todo incluyendo loader
  87  |     
  88  |     // Filtrar errores conocidos/esperados (favicon, etc.)
  89  |     const criticalErrors = errors.filter(
  90  |       (e) => !e.includes('favicon') && !e.includes('404') && !e.includes('net::')
  91  |     );
  92  |     
  93  |     // Permitir warnings, pero no errores de JS puro
  94  |     // (solo informativo, no falla el test)
  95  |     if (criticalErrors.length > 0) {
  96  |       console.warn('Console errors detected:', criticalErrors);
  97  |     }
  98  |   });
  99  | });
  100 | 
```