#!/usr/bin/env node

/**
 * Automated Build Script for Billing Software
 * Builds both web and executable versions
 */

import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import path from "path";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n🔨 ${description}...`, colors.cyan);
  try {
    execSync(command, { stdio: "inherit" });
    log(`✅ ${description} completed!`, colors.green);
  } catch (error) {
    log(`❌ ${description} failed!`, colors.red);
    process.exit(1);
  }
}

function main() {
  log("🚀 Building Billing Software for Distribution", colors.bright);
  log("=".repeat(50), colors.blue);

  // Ensure output directories exist
  if (!existsSync("executables")) {
    mkdirSync("executables");
  }

  // Build the application
  runCommand("npm run build", "Building application");

  // Get command line arguments
  const args = process.argv.slice(2);
  const target = args[0] || "all";

  switch (target) {
    case "web":
      log("\n🌐 Building for Web Deployment", colors.magenta);
      runCommand("npm run build:web", "Optimizing for web");
      log(
        "\n📁 Web build complete! Upload dist/spa/ folder to your hosting provider.",
        colors.green,
      );
      break;

    case "exe":
    case "executable":
      log("\n💻 Building Executables for All Platforms", colors.magenta);
      runCommand("npm run pack:exe:all", "Creating executables");
      log("\n📁 Executables created in executables/ folder!", colors.green);
      break;

    case "win":
    case "windows":
      log("\n🪟 Building Windows Executable", colors.magenta);
      runCommand("npm run pack:exe:win", "Creating Windows .exe");
      log("\n📁 Windows executable created!", colors.green);
      break;

    case "mac":
    case "macos":
      log("\n🍎 Building macOS Executable", colors.magenta);
      runCommand("npm run pack:exe:mac", "Creating macOS executable");
      log("\n📁 macOS executable created!", colors.green);
      break;

    case "linux":
      log("\n🐧 Building Linux Executable", colors.magenta);
      runCommand("npm run pack:exe:linux", "Creating Linux executable");
      log("\n📁 Linux executable created!", colors.green);
      break;

    case "all":
    default:
      log(
        "\n🎯 Building for All Platforms (Web + Executables)",
        colors.magenta,
      );

      // Web build
      runCommand("npm run build:web", "Building for web");

      // Executables
      runCommand("npm run pack:exe:all", "Creating executables");

      log(
        "\n🎉 All builds completed successfully!",
        colors.bright + colors.green,
      );
      log("\n📦 Available outputs:", colors.yellow);
      log(
        "  • executables/ - Standalone executables for Windows, macOS, Linux",
        colors.reset,
      );
      log("  • dist/spa/ - Web deployment files", colors.reset);
      log("  • dist/server/ - Server files", colors.reset);
      break;
  }

  log("\n" + "=".repeat(50), colors.blue);
  log("✨ Build process completed!", colors.bright + colors.green);
  log("\nUsage instructions:", colors.yellow);
  log("  Web: Upload dist/spa/ to hosting provider", colors.reset);
  log("  Desktop: Run executable from executables/ folder", colors.reset);
  log("\nFor detailed instructions, see PACKAGING.md", colors.cyan);
}

// Handle errors gracefully
process.on("uncaughtException", (error) => {
  log(`\n❌ Build failed: ${error.message}`, colors.red);
  process.exit(1);
});

// Run the build
main();
