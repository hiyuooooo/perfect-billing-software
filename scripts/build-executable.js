#!/usr/bin/env node

import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const copyFile = promisify(fs.copyFile);
const mkdir = promisify(fs.mkdir);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function copyDir(src, dest) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

async function buildExecutable() {
  console.log("🔨 Building BillMaster Pro Executable...");

  // 1. Build the application
  console.log("📦 Building application...");
  execSync("npm run build", { stdio: "inherit" });

  // 2. Create executable with pkg
  console.log("⚙️  Creating executable...");
  execSync(
    "npx pkg dist/server/node-build.js --targets node18-win-x64 --out-path temp-exe",
    { stdio: "inherit" },
  );

  // 3. Create final package directory
  const packageDir = path.join(process.cwd(), "BillMaster-Portable");
  if (!fs.existsSync(packageDir)) {
    fs.mkdirSync(packageDir, { recursive: true });
  }

  // 4. Copy executable
  console.log("📁 Packaging files...");
  fs.copyFileSync(
    path.join("temp-exe", "node-build.exe"),
    path.join(packageDir, "BillMaster.exe"),
  );

  // 5. Copy SPA assets
  await copyDir("dist/spa", path.join(packageDir, "spa"));

  // 6. Create startup script
  const startupScript = `@echo off
echo Starting BillMaster Pro...
echo Web interface will open at http://localhost:8080
echo.
start http://localhost:8080
BillMaster.exe
pause`;

  fs.writeFileSync(
    path.join(packageDir, "Start-BillMaster.bat"),
    startupScript,
  );

  // 7. Create README
  const readme = `# BillMaster Pro - Portable Edition

## How to Use:
1. Double-click "Start-BillMaster.bat" to launch the application
2. Your web browser will automatically open to http://localhost:8080
3. The application runs entirely on your computer - no internet required

## Files:
- BillMaster.exe - Main application server
- spa/ - Web interface files (required)
- Start-BillMaster.bat - Launcher script

## Features:
✅ Bill generation and management
✅ Customer transaction import
✅ Stock inventory tracking  
✅ Multi-format export (PDF, Excel, HTML)
✅ Account separation & management
✅ Automated bill numbering
✅ Local data storage (no cloud required)

## System Requirements:
- Windows 10/11
- 100MB disk space
- Modern web browser (Chrome, Firefox, Edge)

## Support:
All data is stored locally in your browser. 
Close the command window to stop the application.
`;

  fs.writeFileSync(path.join(packageDir, "README.txt"), readme);

  // 8. Clean up
  fs.rmSync("temp-exe", { recursive: true, force: true });

  console.log("✅ Build complete!");
  console.log(`📂 Package location: ${packageDir}`);
  console.log("🎉 Ready for distribution!");
}

buildExecutable().catch(console.error);
