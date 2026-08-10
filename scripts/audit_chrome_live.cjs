const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CDP_URL = 'http://127.0.0.1:9222';
const REF_DIR = '/Users/musa/Downloads/sopisafer/carpeta de referencia';
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runChromeLiveAudit() {
  console.log('🌐 Conectando con Google Chrome en puerto 9222 via CDP...\n');

  if (!fs.existsSync(REF_DIR)) {
    fs.mkdirSync(REF_DIR, { recursive: true });
  }

  try {
    const browser = await chromium.connectOverCDP(CDP_URL);
    console.log('✅ Conexión establecida con Google Chrome!');

    const contexts = browser.contexts();
    let context = contexts[0] || (await browser.newContext());
    let pages = context.pages();
    let page = pages[0] || (await context.newPage());

    await page.setViewportSize({ width: 1280, height: 850 });

    // 1. WEB PÚBLICA
    console.log('\n1️⃣ Navegando a la Tienda Pública (http://localhost:5173)...');
    await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
    await sleep(2000);

    const ss1 = path.join(REF_DIR, '01_web_publica.png');
    await page.screenshot({ path: ss1 });
    console.log(`  📸 Captura guardada: ${ss1}`);

    // Abrir bolsa de compras
    const bagBtn = page.locator('button:has(.lucide-shopping-bag)').first();
    if (await bagBtn.isVisible().catch(() => false)) {
      await bagBtn.click();
      await sleep(1500);
      const ss2 = path.join(REF_DIR, '02_bolsa_compras.png');
      await page.screenshot({ path: ss2 });
      console.log(`  📸 Captura guardada: ${ss2}`);
    }

    // 2. PANEL DE ADMINISTRACIÓN - DASHBOARD BENTO GRID
    console.log('\n2️⃣ Navegando al Panel de Administración (http://localhost:5173/admin)...');
    await page.goto('http://localhost:5173/admin', { waitUntil: 'domcontentloaded' });
    await sleep(2500);

    // Si muestra login
    const userInput = page.locator('input[placeholder="Usuario o Email"]');
    if (await userInput.isVisible().catch(() => false)) {
      await userInput.fill('admin');
      await page.locator('input[placeholder="Contraseña"]').fill('admin');
      await page.click('button[type="submit"]');
      await sleep(2500);
    }

    const ss3 = path.join(REF_DIR, '03_admin_dashboard.png');
    await page.screenshot({ path: ss3 });
    console.log(`  📸 Captura guardada: ${ss3}`);

    // 3. CATÁLOGO CON SELECTOR DE SECCIÓN
    console.log('\n3️⃣ Auditando Catálogo y Selector de Sección Web...');
    await page.goto('http://localhost:5173/admin/catalogo', { waitUntil: 'domcontentloaded' });
    await sleep(2000);

    const newProdBtn = page.locator('button:has-text("Nueva Prenda")');
    if (await newProdBtn.isVisible().catch(() => false)) {
      await newProdBtn.click();
      await sleep(1500);
    }
    const ss4 = path.join(REF_DIR, '04_admin_catalogo_selector.png');
    await page.screenshot({ path: ss4 });
    console.log(`  📸 Captura guardada: ${ss4}`);

    // 4. PEDIDOS
    console.log('\n4️⃣ Auditando Pedidos...');
    await page.goto('http://localhost:5173/admin/pedidos', { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    const ss5 = path.join(REF_DIR, '05_admin_pedidos.png');
    await page.screenshot({ path: ss5 });
    console.log(`  📸 Captura guardada: ${ss5}`);

    // 5. AJUSTES 7 BLOQUES
    console.log('\n5️⃣ Auditando Preferencias de la Tienda (Ajustes)...');
    await page.goto('http://localhost:5173/admin/ajustes', { waitUntil: 'domcontentloaded' });
    await sleep(2000);
    const ss6 = path.join(REF_DIR, '06_admin_ajustes_7bloques.png');
    await page.screenshot({ path: ss6 });
    console.log(`  📸 Captura guardada: ${ss6}`);

    console.log('\n🎉 AUDITORÍA VISUAL COMPLETA EN GOOGLE CHROME!');
    console.log(`Todas las capturas se guardaron en: ${REF_DIR}`);

  } catch (err) {
    console.error('❌ Error en auditoría Chrome CDP:', err.message);
  }
}

runChromeLiveAudit();
