import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Configuration — Isafer Boutique
 * 
 * Ejecutar tests:
 *   npm run test:e2e           → todos los tests
 *   npm run test:e2e:headed    → con navegador visible
 *   npm run test:e2e:ui        → modo UI interactivo
 *   npm run test:e2e:report    → ver último reporte HTML
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',

  /* Ejecución */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,

  /* Reportes */
  reporter: [
    ['list'],
    ['html', { outputFolder: './reports', open: 'never' }],
  ],

  /* Configuración global para todos los tests */
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    
    /* Timeouts */
    actionTimeout: 10_000,
    navigationTimeout: 15_000,

    /* Evidencia de fallos */
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },

  /* Timeout por test individual */
  timeout: 30_000,

  /* Levantar dev server automáticamente si no está corriendo */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 30_000,
  },

  /* Proyectos: navegadores y dispositivos */
  projects: [
    /* Desktop */
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Mobile */
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 14'] },
    },
  ],
});
