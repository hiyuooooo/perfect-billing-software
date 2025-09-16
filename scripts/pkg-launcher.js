#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

// This script will be bundled by pkg and handle asset extraction
const isExecutable = process.pkg !== undefined;

if (isExecutable) {
  console.log("🚀 Starting BillMaster Pro (Executable Mode)");
  console.log("📁 Extracting assets...");

  // Create spa directory next to executable
  const exeDir = path.dirname(process.execPath);
  const spaDir = path.join(exeDir, "spa");

  if (!fs.existsSync(spaDir)) {
    console.log(
      "⚠️  SPA assets not found. Please ensure dist/spa/ folder is next to the executable.",
    );
    console.log(`Expected location: ${spaDir}`);
    process.exit(1);
  }

  console.log(`📂 Assets found at: ${spaDir}`);
} else {
  console.log("🚀 Starting BillMaster Pro (Development Mode)");
}

// Start the actual server
require("./node-build.js");
