# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/tests/07-admin-login.spec.ts >> 07 — Ruta de Administración >> la ruta /admin o /admin/login está disponible
- Location: e2e/tests/07-admin-login.spec.ts:5:3

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/admin/login", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '../fixtures/base';
  2  |
  3  | test.describe('07 — Ruta de Administración', () => {
  4  |
  5  |   test('la ruta /admin o /admin/login está disponible', async ({ page }) => {
> 6  |     await page.goto('/admin/login');
     |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  7  |     await page.waitForTimeout(2000);
  8  |
  9  |     // Debe haber un formulario o pantalla de acceso
  10 |     const inputs = page.locator('input');
  11 |     if (await inputs.count() > 0) {
  12 |       await expect(inputs.first()).toBeVisible();
  13 |     }
  14 |   });
  15 |
  16 | });
  17 |
```
