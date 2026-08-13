import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const REF_DIR = "/Users/musa/Downloads/sopisafer/carpeta de referencia";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function captureLiveAudit() {
  console.log("🌐 Iniciando navegador para capturas visuales en vivo...\n");

  if (!fs.existsSync(REF_DIR)) {
    fs.mkdirSync(REF_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 850 },
  });
  const page = await context.newPage();

  try {
    // 1. WEB PÚBLICA
    console.log("1️⃣ Navegando a la Tienda Pública (http://localhost:5173)...");
    await page.goto("http://localhost:5173", { waitUntil: "networkidle" });
    await sleep(2000);

    const ss1 = path.join(REF_DIR, "01_web_publica.png");
    await page.screenshot({ path: ss1, fullPage: true });
    console.log(`  📸 Captura guardada: ${ss1}`);

    // Abrir bolsa de compras
    const bagBtn = page.locator("button:has(.lucide-shopping-bag)").first();
    if (await bagBtn.isVisible().catch(() => false)) {
      await bagBtn.click();
      await sleep(1500);
      const ss2 = path.join(REF_DIR, "02_bolsa_compras.png");
      await page.screenshot({ path: ss2 });
      console.log(`  📸 Captura guardada: ${ss2}`);
    }

    // 2. PANEL DE ADMINISTRACIÓN - LOGIN
    console.log(
      "\n2️⃣ Iniciando sesión en el Panel de Administración (http://localhost:5173/admin/login)...",
    );
    await page.goto("http://localhost:5173/admin/login", {
      waitUntil: "networkidle",
    });
    await sleep(1500);

    await page.fill('input[placeholder="Usuario o Email"]', "admin");
    await page.fill('input[placeholder="Contraseña"]', "admin");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/admin", { timeout: 10000 });
    await sleep(2000);

    // Dashboard Bento Grid
    const ss3 = path.join(REF_DIR, "03_admin_dashboard.png");
    await page.screenshot({ path: ss3, fullPage: true });
    console.log(`  📸 Captura guardada: ${ss3}`);

    // 3. CATÁLOGO CON SELECTOR DE SECCIÓN
    console.log("\n3️⃣ Auditando Catálogo y Selector de Sección Web...");
    await page.goto("http://localhost:5173/admin/catalogo", {
      waitUntil: "networkidle",
    });
    await sleep(2000);

    const newProdBtn = page.locator('button:has-text("Nueva Prenda")');
    if (await newProdBtn.isVisible().catch(() => false)) {
      await newProdBtn.click();
      await sleep(1500);
    }
    const ss4 = path.join(REF_DIR, "04_admin_catalogo_selector.png");
    await page.screenshot({ path: ss4, fullPage: true });
    console.log(`  📸 Captura guardada: ${ss4}`);

    // 4. PEDIDOS
    console.log("\n4️⃣ Auditando Pedidos...");
    await page.goto("http://localhost:5173/admin/pedidos", {
      waitUntil: "networkidle",
    });
    await sleep(2000);
    const ss5 = path.join(REF_DIR, "05_admin_pedidos.png");
    await page.screenshot({ path: ss5, fullPage: true });
    console.log(`  📸 Captura guardada: ${ss5}`);

    // 5. AJUSTES 7 BLOQUES
    console.log("\n5️⃣ Auditando Preferencias de la Tienda (Ajustes)...");
    await page.goto("http://localhost:5173/admin/ajustes", {
      waitUntil: "networkidle",
    });
    await sleep(2000);
    const ss6 = path.join(REF_DIR, "06_admin_ajustes_7bloques.png");
    await page.screenshot({ path: ss6, fullPage: true });
    console.log(`  📸 Captura guardada: ${ss6}`);

    console.log("\n🎉 TODAS LAS CAPTURAS VISUALES EN VIVO GUARDADAS AL 100%!");
    console.log(`Ubicación: ${REF_DIR}`);
  } catch (err) {
    console.error("❌ Error capturando pantallas:", err.message);
  } finally {
    await browser.close();
  }
}

captureLiveAudit();
