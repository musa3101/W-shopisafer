import { chromium } from 'playwright';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const DEBUG_PORT = 9222;
const CDP_URL = `http://127.0.0.1:${DEBUG_PORT}`;
const USER_DATA_DIR = '/Users/musa/Library/Application Support/Google/ChromeDev';
const SCREENSHOT_PATH = '/Users/musa/Downloads/sopisafer/carpeta de referencia/chrome_test_success.png';

async function isChromeListening() {
  try {
    const res = await fetch(`${CDP_URL}/json/version`);
    if (res.ok) {
      const data = await res.json();
      console.log('Found Chrome listening on 9222. Browser version:', data.Browser);
      return true;
    }
  } catch (err) {
    // Chrome is not listening
  }
  return false;
}

async function launchChromeRemote() {
  console.log('Chrome is not running with remote debugging. Attempting to launch a new debug instance...');
  // Ensure the ChromeDev profile directory exists
  if (!fs.existsSync(USER_DATA_DIR)) {
    fs.mkdirSync(USER_DATA_DIR, { recursive: true });
  }

  // Launch Chrome in the background
  const command = `"${CHROME_PATH}" --remote-debugging-port=${DEBUG_PORT} --user-data-dir="${USER_DATA_DIR}" --no-first-run --no-default-browser-check > /dev/null 2>&1 &`;
  console.log('Running launch command:', command);
  exec(command);

  // Wait for Chrome to boot up
  for (let i = 0; i < 10; i++) {
    await sleep(1000);
    if (await isChromeListening()) {
      console.log('Chrome debug instance successfully launched and listening!');
      return true;
    }
    console.log(`Waiting for Chrome to listen on port ${DEBUG_PORT}... (${i + 1}/10)`);
  }
  throw new Error('Failed to launch and connect to Chrome debug instance.');
}

async function run() {
  try {
    let connected = await isChromeListening();
    if (!connected) {
      connected = await launchChromeRemote();
    }

    console.log('Connecting Playwright to Chrome via CDP...');
    const browser = await chromium.connectOverCDP(CDP_URL);
    console.log('Connected successfully!');

    // Get the first context and page
    const contexts = browser.contexts();
    let context = contexts[0];
    if (!context) {
      context = await browser.newContext();
    }

    let pages = context.pages();
    let page = pages[0];
    if (!page) {
      page = await context.newPage();
    }

    const testUrl = 'https://example.com';
    console.log(`Navigating page to ${testUrl}...`);
    await page.goto(testUrl, { waitUntil: 'load', timeout: 30000 });

    const title = await page.title();
    console.log(`Page title loaded successfully: "${title}"`);

    // Ensure the folder exists
    const screenshotDir = path.dirname(SCREENSHOT_PATH);
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    console.log(`Taking screenshot and saving it to ${SCREENSHOT_PATH}...`);
    await page.screenshot({ path: SCREENSHOT_PATH });
    console.log('Screenshot saved successfully!');

    await browser.close();
    console.log('Chrome test verification completed successfully. Connection is fully working!');
  } catch (error) {
    console.error('Error during Chrome connection test:', error);
    process.exit(1);
  }
}

run();
