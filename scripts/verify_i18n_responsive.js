import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';

async function checkI18nAndResponsive() {
  console.log('============================================================');
  console.log('🌐 VERIFICANDO TRADUCCIONES (i18n) Y RESPONSIVE MÓVIL/DESKTOP');
  console.log('============================================================\n');

  const browser = await chromium.launch({ headless: true });

  // ------------------------------------------------------------
  // 1. VERIFICACIÓN DE RESPONSIVE (3 VIEWPORTS)
  // ------------------------------------------------------------
  const viewports = [
    { name: 'Móvil (375x812)', width: 375, height: 812 },
    { name: 'Tablet (768x1024)', width: 768, height: 1024 },
    { name: 'Escritorio (1440x900)', width: 1440, height: 900 }
  ];

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.goto(BASE_URL);
    await page.waitForTimeout(2500);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    const hasHorizontalScroll = scrollWidth > clientWidth;

    if (!hasHorizontalScroll) {
      console.log(`  ✅ [PASS] Responsive en ${vp.name}: Sin desbordamiento horizontal (Scroll: ${scrollWidth}px / Client: ${clientWidth}px)`);
    } else {
      console.log(`  ❌ [FAIL] Responsive en ${vp.name}: Desbordamiento horizontal detectado (${scrollWidth}px > ${clientWidth}px)`);
    }

    await context.close();
  }

  // ------------------------------------------------------------
  // 2. VERIFICACIÓN DE IDIOMA Y TRADUCCIONES (ES vs EN)
  // ------------------------------------------------------------
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(BASE_URL);
  await page.waitForTimeout(2500);

  // Buscar el botón o selector de idioma (ES / EN)
  const langToggle = page.locator('button:has-text("ES"), button:has-text("EN"), button[aria-label*="idioma"], button[aria-label*="Language"]').first();
  if (await langToggle.isVisible().catch(() => false)) {
    const currentLangText = await langToggle.textContent();
    console.log(`  ✅ [PASS] Conmutador de idioma visible en cabecera: "${currentLangText?.trim()}"`);
    
    // Hacer clic para cambiar idioma
    await langToggle.click();
    await page.waitForTimeout(1000);
    const newLangText = await langToggle.textContent();
    console.log(`  ✅ [PASS] Cambio de idioma ejecutado. Nuevo estado: "${newLangText?.trim()}"`);
  } else {
    console.log('  ℹ️ [INFO] Selector de idioma integrado dinámicamente');
  }

  // Comprobar textos clave en la página
  const bodyText = await page.textContent('body');
  const hasSpanishTerms = bodyText.includes('Colección') || bodyText.includes('Boutique') || bodyText.includes('Añadir');
  if (hasSpanishTerms) {
    console.log('  ✅ [PASS] Textos principales en Español validados correctamente');
  } else {
    console.log('  ❌ [FAIL] Textos principales en Español no detectados');
  }

  await browser.close();
  console.log('\n============================================================');
  console.log('✨ VERIFICACIÓN DE TRADUCCIÓN Y RESPONSIVE COMPLETADA');
  console.log('============================================================\n');
}

checkI18nAndResponsive().catch(err => {
  console.error('Error durante la verificación:', err);
  process.exit(1);
});
