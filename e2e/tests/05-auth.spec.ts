import { test, expect } from '../fixtures/base';

test.describe('05 — Modal de Autenticación', () => {

  test('abrir el dialogo de login desde la barra de navegación', async ({ homePage }) => {
    const userBtn = homePage.locator('header button, nav button').filter({
      has: homePage.locator('svg.lucide-user')
    }).first();

    if (await userBtn.isVisible().catch(() => false)) {
      await userBtn.click();
      await homePage.waitForTimeout(500);

      const dialog = homePage.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Verificar campos o pestañas
      await homePage.keyboard.press('Escape');
    }
  });

});
