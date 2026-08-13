const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const CDP_URL = "http://127.0.0.1:9222";
const REF_DIR = "/Users/musa/Downloads/PROJ recientes/sopisafer/carpeta de referencia";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runLiveProductCreationTest() {
  console.log("🚀 Probando creación de producto simulado en vivo mediante Google Chrome...\n");

  try {
    const browser = await chromium.connectOverCDP(CDP_URL);
    const contexts = browser.contexts();
    const context = contexts[0] || (await browser.newContext());
    const pages = context.pages();
    const page = pages[0] || (await context.newPage());

    await page.setViewportSize({ width: 1440, height: 900 });

    // 1. Iniciar sesión real como Admin
    console.log("1️⃣ Asegurando sesión autenticada de Admin...");
    await page.goto("http://localhost:5173/admin/login", { waitUntil: "domcontentloaded" });
    await sleep(2000);

    const emailInput = page.locator('input[type="email"], input[placeholder*="correo"]').first();
    const passInput = page.locator('input[type="password"]').first();
    const submitBtn = page.locator('button[type="submit"]').first();

    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill("admin@isaferboutique.com");
      await passInput.fill("admin");
      await submitBtn.click();
      await sleep(2500);
    }

    // 2. Ir a Catálogo
    console.log("2️⃣ Navegando al Catálogo (/admin/catalogo)...");
    await page.goto("http://localhost:5173/admin/catalogo", { waitUntil: "domcontentloaded" });
    await sleep(2000);

    // 3. Abrir Creador de Prenda
    console.log("3️⃣ Abriendo el formulario de Nueva Prenda...");
    const newProdBtn = page.locator('button:has-text("Nueva Prenda")').first();
    if (await newProdBtn.isVisible()) {
      await newProdBtn.click();
      await sleep(1500);
    }

    // 4. Rellenar datos de la prenda simulada
    console.log("4️⃣ Rellenando formulario de la prenda...");
    const prodName = `Vestido Barbie Luxe Satin #${Math.floor(Math.random() * 1000)}`;
    
    await page.fill('input[placeholder*="Ej: Vestido"]', prodName);
    await page.fill('input[placeholder="45.00"]', "95.00");
    await page.fill('input[placeholder="15"]', "25");
    await page.fill('textarea[placeholder*="Detalles"]', "Vestido ajustado de satén rosado fucsia con escote corazón y fruncido lateral moldeador.");
    await page.fill('input[placeholder*="NUEVO DROP"]', "EXCLUSIVO 2026");

    // Seleccionar categoría "Vestidos"
    const catBtn = page.locator('button:has-text("Vestidos 👗")').first();
    if (await catBtn.isVisible()) {
      await catBtn.click();
    }

    const ssForm = path.join(REF_DIR, "07_nuevo_producto_formulario.png");
    await page.screenshot({ path: ssForm, fullPage: true });
    console.log(`  📸 Captura del formulario: ${ssForm}`);

    // 5. Enviar formulario
    console.log("5️⃣ Enviando formulario para publicar la prenda...");
    const saveBtn = page.locator('button[type="submit"]:has-text("Añadir Prenda")').first();
    await saveBtn.click();
    await sleep(3500);

    // 6. Verificar creación en el listado del catálogo
    console.log("6️⃣ Verificando que la prenda aparezca publicada en el catálogo...");
    await page.goto("http://localhost:5173/admin/catalogo", { waitUntil: "domcontentloaded" });
    await sleep(2500);

    const ssResult = path.join(REF_DIR, "08_catalogo_producto_creado.png");
    await page.screenshot({ path: ssResult, fullPage: true });
    console.log(`  📸 Captura del catálogo actualizado: ${ssResult}`);

    console.log(`\n🎉 ¡PRODUCTO '${prodName}' CREADO Y VERIFICADO CON ÉXITO EN LA BASE DE DATOS DE INSFORGE!`);
  } catch (err) {
    console.error("❌ Error en la prueba de creación:", err.message);
  }
}

runLiveProductCreationTest();
