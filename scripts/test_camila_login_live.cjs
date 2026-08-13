const { chromium } = require("playwright");

const CDP_URL = "http://127.0.0.1:9222";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function testCamilaLogin() {
  console.log("🔑 Probando inicio de sesión con usuario 'camila' y contraseña 'camila' en Google Chrome...\n");

  try {
    const browser = await chromium.connectOverCDP(CDP_URL);
    const contexts = browser.contexts();
    const context = contexts[0] || (await browser.newContext());
    const pages = context.pages();
    const page = pages[0] || (await context.newPage());

    await page.setViewportSize({ width: 1440, height: 900 });

    // 1. Cerrar sesión previa si estamos en /admin
    await page.goto("http://localhost:5173/admin", { waitUntil: "domcontentloaded" });
    await sleep(1500);

    const logoutBtn = page.locator('button:has-text("Cerrar Sesión")').first();
    if (await logoutBtn.isVisible().catch(() => false)) {
      await logoutBtn.click();
      await sleep(2000);
    }

    // 2. Ir al login
    await page.goto("http://localhost:5173/admin/login", { waitUntil: "domcontentloaded" });
    await sleep(1500);

    const emailInput = page.locator('input[placeholder*="Usuario o Email"]').first();
    const passInput = page.locator('input[placeholder*="Contraseña"]').first();
    const submitBtn = page.locator('button[type="submit"]').first();

    if (await emailInput.isVisible().catch(() => false)) {
      await emailInput.fill("camila");
      await passInput.fill("camila");
      console.log("  ✍️ Introducido -> Usuario: camila | Contraseña: camila");

      await submitBtn.click();
      await sleep(3500);
    }

    const currentUrl = page.url();
    console.log(`  📍 URL actual tras login: ${currentUrl}`);

    if (currentUrl.includes("/admin") && !currentUrl.includes("/login")) {
      console.log("🎉 ¡INICIO DE SESIÓN EXITOSO! Accedió a /admin correctamente con usuario 'camila' y contraseña 'camila'.");
    } else {
      console.error("❌ El inicio de sesión no redirigió a /admin.");
    }
  } catch (err) {
    console.error("❌ Error durante la prueba de login:", err.message);
  }
}

testCamilaLogin();
