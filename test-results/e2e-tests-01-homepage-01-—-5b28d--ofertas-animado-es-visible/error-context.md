# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/tests/01-homepage.spec.ts >> 01 — Homepage & Navegación >> el banner de ofertas animado es visible
- Location: e2e/tests/01-homepage.spec.ts:64:3

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/", waiting until "load"

```

# Test source

```ts
  1  | import { test as base, expect, type Page } from '@playwright/test';
  2  |
  3  | /**
  4  |  * Fixture base reutilizable para Isafer Boutique E2E
  5  |  *
  6  |  * Proporciona helpers comunes y espera a que el InitialLoader termine
  7  |  * antes de cada test, para que todos los tests empiecen con la app lista.
  8  |  */
  9  |
  10 | /** Helper: esperar a que el InitialLoader desaparezca */
  11 | async function waitForAppReady(page: Page) {
  12 |   // El loader tiene un timeout de 2.8s. Esperamos hasta 5s.
  13 |   // Primero intentamos detectar si el loader está presente
  14 |   const loaderOverlay = page.locator('.fixed.inset-0.z-\\[9999\\]');
  15 |
  16 |   try {
  17 |     // Si el loader está visible, esperamos a que desaparezca
  18 |     const isVisible = await loaderOverlay.isVisible({ timeout: 1000 }).catch(() => false);
  19 |     if (isVisible) {
  20 |       await loaderOverlay.waitFor({ state: 'detached', timeout: 5000 });
  21 |     }
  22 |   } catch {
  23 |     // Si no aparece el loader, la app ya está lista
  24 |   }
  25 | }
  26 |
  27 | /** Helper: scroll suave a una sección */
  28 | async function scrollToSection(page: Page, sectionId: string) {
  29 |   await page.evaluate((id) => {
  30 |     const el = document.getElementById(id);
  31 |     if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  32 |   }, sectionId);
  33 |   // Esperar a que termine el scroll
  34 |   await page.waitForTimeout(800);
  35 | }
  36 |
  37 | /** Helper: cerrar cualquier modal/dialog abierto */
  38 | async function closeAnyDialog(page: Page) {
  39 |   const dialog = page.locator('[role="dialog"]');
  40 |   if (await dialog.isVisible({ timeout: 500 }).catch(() => false)) {
  41 |     // Intentar presionar Escape para cerrar
  42 |     await page.keyboard.press('Escape');
  43 |     await dialog.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {});
  44 |   }
  45 | }
  46 |
  47 | // Extend the base test with custom fixtures
  48 | export const test = base.extend<{
  49 |   homePage: Page;
  50 | }>({
  51 |   homePage: async ({ page }, use) => {
  52 |     // Navegar a la home y esperar que la app esté lista
> 53 |     await page.goto('/');
     |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  54 |     await waitForAppReady(page);
  55 |     await use(page);
  56 |   },
  57 | });
  58 |
  59 | export { expect, waitForAppReady, scrollToSection, closeAnyDialog };
  60 |
```
