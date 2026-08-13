const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const CDP_URL = "http://127.0.0.1:9222";
const REF_DIRS = [
  "/Users/musa/Downloads/PROJ recientes/sopisafer/carpeta de referencia",
  "/Users/musa/Downloads/sopisafer/carpeta de referencia"
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runAdminLiveAudit() {
  console.log("🌐 Conectando con Google Chrome en puerto 9222 vía CDP para auditoría del Panel Admin...\n");

  REF_DIRS.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      try { fs.mkdirSync(dir, { recursive: true }); } catch (e) {}
    }
  });

  const saveScreenshots = async (page, filename) => {
    for (const dir of REF_DIRS) {
      if (fs.existsSync(dir)) {
        const filePath = path.join(dir, filename);
        await page.screenshot({ path: filePath, fullPage: true });
        console.log(`  📸 Captura guardada en: ${filePath}`);
      }
    }
  };

  try {
    const browser = await chromium.connectOverCDP(CDP_URL);
    console.log("✅ ¡Conexión CDP con Google Chrome establecida con éxito!");

    const contexts = browser.contexts();
    const context = contexts[0] || (await browser.newContext());
    const pages = context.pages();
    const page = pages[0] || (await context.newPage());

    await page.setViewportSize({ width: 1440, height: 900 });

    // PASO 1: NAVEGACIÓN A LOGIN / PROTECCIÓN DE RUTAS
    console.log("\n1️⃣ Navegando a http://localhost:5173/admin/login...");
    await page.goto("http://localhost:5173/admin/login", { waitUntil: "domcontentloaded" });
    await sleep(2000);
    await saveScreenshots(page, "01_admin_login_screen.png");

    // PASO 2: INICIAR SESIÓN DE ADMINISTRADORA
    console.log("\n2️⃣ Iniciando sesión como Administradora (admin@isaferboutique.com)...");
    const emailInput = page.locator('input[type="email"], input[placeholder*="correo"], input[placeholder*="Email"]').first();
    const passInput = page.locator('input[type="password"]').first();
    const submitBtn = page.locator('button[type="submit"]').first();

    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill("admin@isaferboutique.com");
      await passInput.fill("admin");
      await submitBtn.click();
      await sleep(3000);
    }

    // PASO 3: RESUMEN / DASHBOARD DE BENTO METRICS
    console.log("\n3️⃣ Auditando Tab Resumen (/admin)...");
    await page.goto("http://localhost:5173/admin", { waitUntil: "domcontentloaded" });
    await sleep(2500);
    await saveScreenshots(page, "02_admin_dashboard_resumen.png");

    // PASO 4: PEDIDOS (ORDER MANAGER)
    console.log("\n4️⃣ Auditando Tab Pedidos (/admin/pedidos)...");
    await page.goto("http://localhost:5173/admin/pedidos", { waitUntil: "domcontentloaded" });
    await sleep(2000);
    await saveScreenshots(page, "03_admin_pedidos_manager.png");

    // PASO 5: CATÁLOGO Y CREADOR DE PRENDAS
    console.log("\n5️⃣ Auditando Tab Catálogo (/admin/catalogo)...");
    await page.goto("http://localhost:5173/admin/catalogo", { waitUntil: "domcontentloaded" });
    await sleep(2000);
    await saveScreenshots(page, "04_admin_catalogo.png");

    const newProdBtn = page.locator('button:has-text("Nueva Prenda"), button:has-text("Añadir")').first();
    if (await newProdBtn.isVisible().catch(() => false)) {
      await newProdBtn.click();
      await sleep(1500);
      await saveScreenshots(page, "05_admin_creador_prenda_modal.png");
    }

    // PASO 6: PREFERENCIAS Y AJUSTES (CAMILA PROFILE & COUPONS)
    console.log("\n6️⃣ Auditando Tab Ajustes (/admin/ajustes)...");
    await page.goto("http://localhost:5173/admin/ajustes", { waitUntil: "domcontentloaded" });
    await sleep(2500);
    await saveScreenshots(page, "06_admin_ajustes_preferencias.png");

    console.log("\n🎉 AUDITORÍA VISUAL EN GOOGLE CHROME COMPLETADA CON ÉXITO!");
  } catch (err) {
    console.error("❌ Error durante la auditoría Chrome CDP:", err.message);
  }
}

runAdminLiveAudit();
