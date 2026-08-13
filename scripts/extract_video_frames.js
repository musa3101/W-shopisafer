import http from "http";
import fs from "fs";
import path from "path";
import { chromium } from "playwright";

const VIDEO_PATH =
  "/Users/musa/Downloads/sopisafer/carpeta de referencia/IMG_5003.MOV";
const OUTPUT_DIR = "/Users/musa/Downloads/sopisafer/carpeta de referencia";
const PORT = 8765;

// Step 1: Start a tiny HTTP server to serve the video file
const server = http.createServer((req, res) => {
  if (req.url === "/video.mov") {
    const stat = fs.statSync(VIDEO_PATH);
    res.writeHead(200, {
      "Content-Type": "video/quicktime",
      "Content-Length": stat.size,
      "Accept-Ranges": "bytes",
    });
    fs.createReadStream(VIDEO_PATH).pipe(res);
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, async () => {
  console.log(`Video server running on http://localhost:${PORT}/video.mov`);

  try {
    const browser = await chromium.connectOverCDP("http://127.0.0.1:9222");
    const context = browser.contexts()[0] || (await browser.newContext());
    const page = await context.newPage();
    await page.setViewportSize({ width: 375, height: 812 });

    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#000;display:flex;justify-content:center;align-items:center;min-height:100vh;">
        <video id="vid" src="http://localhost:${PORT}/video.mov" style="max-width:100%;max-height:100vh;" muted preload="auto"></video>
      </body>
      </html>
    `);

    console.log("Waiting for video to load...");
    await page.waitForFunction(
      () => {
        const v = document.getElementById("vid");
        return v && v.readyState >= 2 && v.duration > 0;
      },
      { timeout: 30000 },
    );

    const duration = await page.evaluate(
      () => document.getElementById("vid").duration,
    );
    console.log(`Video duration: ${duration}s`);

    // Calculate good sample timestamps
    const timestamps = [];
    for (let t = 0; t < duration; t += 3) {
      timestamps.push(Math.min(t, duration - 0.1));
    }

    for (const t of timestamps) {
      console.log(`Seeking to ${t.toFixed(1)}s...`);
      await page.evaluate((time) => {
        const v = document.getElementById("vid");
        v.currentTime = time;
      }, t);

      // Wait for seek
      await page
        .waitForFunction(
          (time) => {
            const v = document.getElementById("vid");
            return Math.abs(v.currentTime - time) < 1;
          },
          t,
          { timeout: 5000 },
        )
        .catch(() => {});

      await new Promise((r) => setTimeout(r, 500));

      const filename = `pullbear_frame_${String(Math.round(t)).padStart(2, "0")}s.png`;
      await page.screenshot({
        path: path.join(OUTPUT_DIR, filename),
        type: "png",
      });
      console.log(`  -> ${filename}`);
    }

    console.log("All frames captured!");
    await page.close();
    await browser.close();
  } catch (error) {
    console.error("Error:", error);
  } finally {
    server.close();
    process.exit(0);
  }
});
