#!/usr/bin/env node

import { chromium } from "playwright";
import { spawn } from "child_process";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
// Write directly into the built output so it is guaranteed to be deployed.
const outputPath = path.join(projectRoot, "dist", "og-image.png");
const basePath = process.env.VITE_BASE_PATH || "/";
const basePathForLog = basePath.endsWith("/") ? basePath : `${basePath}/`;

const PORT = process.env.PORT || "4173";
const HOST = "127.0.0.1";
const ORIGIN = `http://${HOST}:${PORT}`;

// Standard Open Graph image dimensions
const VIEWPORT_WIDTH = 1200;
const VIEWPORT_HEIGHT = 630;

async function isServerUp() {
  try {
    const response = await fetch(ORIGIN, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

function startPreviewServer() {
  const env = { ...process.env, PORT };

  const child = spawn(
    "npm",
    ["run", "preview", "--", "--host", HOST, "--port", PORT, "--strictPort"],
    {
      cwd: projectRoot,
      env,
      stdio: ["ignore", "pipe", "pipe"],
      detached: process.platform !== "win32",
    }
  );

  child.stdout.on("data", (chunk) => {
    console.log(`[preview] ${chunk.toString().trim()}`);
  });
  child.stderr.on("data", (chunk) => {
    console.error(`[preview] ${chunk.toString().trim()}`);
  });

  return child;
}

async function waitForServer(proc) {
  const timeoutMs = 60000;
  const intervalMs = 300;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (proc.exitCode !== null) {
      throw new Error(`Preview server exited early with code ${proc.exitCode}`);
    }

    if (await isServerUp()) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Timed out waiting for preview server to start");
}

async function killServer(proc) {
  if (!proc) return;

  const waitForExit = new Promise((resolve) => {
    const timeout = setTimeout(() => {
      if (!proc.killed) {
        try {
          if (process.platform !== "win32") {
            process.kill(-proc.pid, "SIGKILL");
          } else {
            proc.kill("SIGKILL");
          }
        } catch {
          // ignore
        }
      }
    }, 5000);

    proc.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
  });

  try {
    if (process.platform !== "win32") {
      process.kill(-proc.pid, "SIGINT");
    } else {
      proc.kill("SIGINT");
    }
  } catch {
    // already gone
  }

  await waitForExit;
}

async function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: projectRoot,
      stdio: "inherit",
    });

    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });
}

async function captureScreenshot() {
  console.log(`Launching browser with viewport ${VIEWPORT_WIDTH}x${VIEWPORT_HEIGHT}...`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
  });
  const page = await context.newPage();

  page.on("console", (message) => {
    const type = message.type();
    if (type === "error" || type === "warning") {
      console.log(`[client ${type}] ${message.text()}`);
    }
  });

  page.on("requestfailed", (request) => {
    console.error(`[request failed] ${request.url()} - ${request.failure().errorText}`);
  });

  page.on("response", (response) => {
    if (response.status() >= 400) {
      console.error(`[${response.status()}] ${response.url()}`);
    }
  });

  try {
    // Ensure base path ends with slash for navigation
    const basePathWithSlash = basePath.endsWith('/') ? basePath : `${basePath}/`;
    const targetUrl = `${ORIGIN}${basePathWithSlash}`;
    console.log(`Navigating to ${targetUrl}...`);
    await page.goto(targetUrl, { waitUntil: "networkidle" });

    // Wait for the main content to render (accept loading state or actual content)
    await page.waitForSelector("#root", { state: "attached", timeout: 10000 });

    // Give the page a moment to load data or show loading state
    await page.waitForTimeout(2000);

    // Wait for fonts and images to load, plus animations to settle
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Ensure output directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Take full page screenshot at the viewport size
    await page.screenshot({
      path: outputPath,
      type: "png",
      clip: { x: 0, y: 0, width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
    });

    console.log(`Screenshot saved to ${path.relative(projectRoot, outputPath)}`);

    const stats = await fs.stat(outputPath);
    const sizeKb = (stats.size / 1024).toFixed(1);
    console.log(
      `og-image details: size=${sizeKb}KB, mtime=${stats.mtime.toISOString()}, deploy path=${path.relative(projectRoot, outputPath)}`
    );

    const publicFiles = await fs.readdir(path.join(projectRoot, "public"));
    console.log(`public/ contents: ${publicFiles.join(", ")}`);

    const distFiles = await fs.readdir(path.join(projectRoot, "dist"));
    console.log(`dist/ contents: ${distFiles.join(", ")}`);
  } finally {
    await browser.close();
  }
}

async function main() {
  console.log(
    `Building project with VITE_BASE_PATH='${basePath}' (og-image will be served from '${basePathForLog}og-image.png')...`
  );
  await runCommand("npm", ["run", "build"]);

  const serverAlreadyRunning = await isServerUp();
  let serverProcess;

  if (serverAlreadyRunning) {
    console.log("Preview server already running");
  } else {
    console.log("Starting preview server...");
    serverProcess = startPreviewServer();
    try {
      await waitForServer(serverProcess);
      console.log("Preview server ready");
    } catch (error) {
      await killServer(serverProcess);
      throw error;
    }
  }

  try {
    await captureScreenshot();
  } finally {
    if (serverProcess) {
      console.log("Shutting down preview server...");
      await killServer(serverProcess);
    }
  }

  console.log("Done!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
