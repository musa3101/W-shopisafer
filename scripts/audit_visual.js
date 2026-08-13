import { chromium } from "playwright";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";

const execAsync = promisify(exec);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CHROME_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const DEBUG_PORT = 9222;
const CDP_URL = `http://127.0.0.1:${DEBUG_PORT}`;
const USER_DATA_DIR =
  "/Users/musa/Library/Application Support/Google/ChromeDev";
const BASE_DIR = "/Users/musa/Downloads/sopisafer/carpeta de referencia";

async function isChromeListening() {
  try {
    const res = await fetch(`${CDP_URL}/json/version`);
    if (res.ok) {
      const data = await res.json();
      console.log("Found Chrome listening on 9222. Version:", data.Browser);
      return true;
    }
  } catch (err) {
    // Not listening
  }
  return false;
}

async function launchChromeRemote() {
  console.log(
    "Chrome is not running with remote debugging. Launching a new instance...",
  );
  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }

  const command = `"${CHROME_PATH}" --remote-debugging-port=${DEBUG_PORT} --user-data-dir="${USER_DATA_DIR}" --no-first-run --no-default-browser-check > /dev/null 2>&1 &`;
  console.log("Running launch command:", command);
  exec(command);

  for (let i = 0; i < 10; i++) {
    await sleep(1000);
    if (await isChromeListening()) {
      console.log("Chrome debug instance successfully launched!");
      return true;
    }
    console.log(
      `Waiting for Chrome to listen on port ${DEBUG_PORT}... (${i + 1}/10)`,
    );
  }
  throw new Error("Failed to launch and connect to Chrome.");
}

async function runAudit() {
  try {
    // Asegurar directorio base de capturas
    if (!fs.existsSync(BASE_DIR)) {
      fs.mkdirSync(BASE_DIR, { recursive: true });
    }

    let connected = await isChromeListening();
    if (!connected) {
      connected = await launchChromeRemote();
    }

    console.log("Connecting Playwright to Chrome via CDP...");
    const browser = await chromium.connectOverCDP(CDP_URL);

    // Configurar contexto escritorio
    console.log("Creating desktop context (1280x800)...");
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      deviceScaleFactor: 1,
    });

    const page = await desktopContext.newPage();
    console.log("Navigating to local site...");
    await page.goto("http://localhost:5173/", {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    await sleep(3000); // Dar tiempo para renderizado completo y animaciones

    // Captura Desktop Home
    const desktopHomePath = path.join(BASE_DIR, "desktop_home.png");
    console.log(`Taking desktop home screenshot: ${desktopHomePath}`);
    await page.screenshot({ path: desktopHomePath, fullPage: false });

    // Cerrar contexto desktop
    await desktopContext.close();

    // Contexto móvil
    console.log("Creating mobile context (375x812)...");
    const mobileContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
      deviceScaleFactor: 3,
      isMobile: true,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    });

    const mobilePage = await mobileContext.newPage();
    console.log("Navigating in mobile mode...");
    await mobilePage.goto("http://localhost:5173/", {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    await sleep(3000);

    // Captura Mobile Home
    const mobileHomePath = path.join(BASE_DIR, "mobile_home.png");
    console.log(`Taking mobile home screenshot: ${mobileHomePath}`);
    await mobilePage.screenshot({ path: mobileHomePath, fullPage: false });

    // Intentar abrir el menú móvil
    // Busquemos el botón de menú móvil en el header.
    // De acuerdo a index.tsx suele ser un botón con icono "Menu" de lucide-react.
    // Vamos a buscar un botón o elemento clickable con Menu.
    console.log("Attempting to open mobile menu...");
    const menuButton = await mobilePage
      .locator(
        'button:has(svg.lucide-menu), button[aria-label*="menu"], svg.lucide-menu',
      )
      .first();
    if ((await menuButton.count()) > 0) {
      await menuButton.click();
      await sleep(1500); // Esperar a que se despliegue el menú con su animación

      const mobileMenuPath = path.join(BASE_DIR, "mobile_menu.png");
      console.log(`Taking mobile menu screenshot: ${mobileMenuPath}`);
      await mobilePage.screenshot({ path: mobileMenuPath });

      // Cerrar menú móvil
      const closeButton = await mobilePage
        .locator("button:has(svg.lucide-x), svg.lucide-x")
        .first();
      if ((await closeButton.count()) > 0) {
        await closeButton.click();
        await sleep(1000);
      }
    } else {
      console.log("Could not find mobile menu button.");
    }

    // Navegar al panel admin
    console.log("Navigating to admin portal...");
    await mobilePage.goto("http://localhost:5173/admin", {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    await sleep(3000);

    const adminLoginPath = path.join(BASE_DIR, "admin_portal.png");
    console.log(`Taking admin portal screenshot: ${adminLoginPath}`);
    await mobilePage.screenshot({ path: adminLoginPath });

    await mobileContext.close();
    await browser.close();
    console.log(
      "✓ Visual audit completed successfully! Screenshots saved in: ",
      BASE_DIR,
    );
  } catch (error) {
    console.error("Error during visual audit:", error);
  }
}

runAudit();
