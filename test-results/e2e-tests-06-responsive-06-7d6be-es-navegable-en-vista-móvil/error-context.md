# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e/tests/06-responsive.spec.ts >> 06 — Adaptabilidad Responsive >> el sitio es navegable en vista móvil
- Location: e2e/tests/06-responsive.spec.ts:5:3

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '../fixtures/base';
  2  |
  3  | test.describe('06 — Adaptabilidad Responsive', () => {
  4  |
  5  |   test('el sitio es navegable en vista móvil', async ({ page }) => {
  6  |     await page.setViewportSize({ width: 375, height: 667 });
> 7  |     await page.goto('/');
     |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  8  |     await page.waitForTimeout(3000); // Esperar loader
  9  |
  10 |     const body = page.locator('body');
  11 |     await expect(body).toBeVisible();
  12 |
  13 |     // Comprobar menú hamburguesa si existe
  14 |     const menuBtn = page.locator('button').filter({ has: page.locator('svg.lucide-menu') }).first();
  15 |     if (await menuBtn.isVisible().catch(() => false)) {
  16 |       await menuBtn.click();
  17 |       await page.waitForTimeout(500);
  18 |     }
  19 |   });
  20 |
  21 | });
  22 |
```
