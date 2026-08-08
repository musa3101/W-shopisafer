import { test as base, expect, type Page } from '@playwright/test';

/**
 * Fixture base reutilizable para Isafer Boutique E2E
 *
 * Proporciona helpers comunes y espera a que el InitialLoader termine
 * antes de cada test, para que todos los tests empiecen con la app lista.
 */

/** Helper: esperar a que el InitialLoader desaparezca */
async function waitForAppReady(page: Page) {
  // El loader tiene un timeout de 2.8s. Esperamos hasta 5s.
  // Primero intentamos detectar si el loader está presente
  const loaderOverlay = page.locator('.fixed.inset-0.z-\\[9999\\]');
  
  try {
    // Si el loader está visible, esperamos a que desaparezca
    const isVisible = await loaderOverlay.isVisible({ timeout: 1000 }).catch(() => false);
    if (isVisible) {
      await loaderOverlay.waitFor({ state: 'detached', timeout: 5000 });
    }
  } catch {
    // Si no aparece el loader, la app ya está lista
  }
}

/** Helper: scroll suave a una sección */
async function scrollToSection(page: Page, sectionId: string) {
  await page.evaluate((id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, sectionId);
  // Esperar a que termine el scroll
  await page.waitForTimeout(800);
}

/** Helper: cerrar cualquier modal/dialog abierto */
async function closeAnyDialog(page: Page) {
  const dialog = page.locator('[role="dialog"]');
  if (await dialog.isVisible({ timeout: 500 }).catch(() => false)) {
    // Intentar presionar Escape para cerrar
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'hidden', timeout: 2000 }).catch(() => {});
  }
}

// Extend the base test with custom fixtures
export const test = base.extend<{
  homePage: Page;
}>({
  homePage: async ({ page }, use) => {
    // Navegar a la home y esperar que la app esté lista
    await page.goto('/');
    await waitForAppReady(page);
    await use(page);
  },
});

export { expect, waitForAppReady, scrollToSection, closeAnyDialog };
