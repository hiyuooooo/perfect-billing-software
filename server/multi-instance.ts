import path from "path";
import { createServer } from "./index";
import * as express from "express";

// Account-specific server configuration
interface AccountConfig {
  accountId: string;
  accountName: string;
  port: number;
  storagePrefix: string;
}

export function createAccountServer(config: AccountConfig) {
  const app = createServer();

  // Add account-specific middleware
  app.use((req, res, next) => {
    // Inject account configuration into requests
    req.accountConfig = config;
    next();
  });

  // Add account info endpoint
  app.get("/api/account-info", (req, res) => {
    res.json({
      accountId: config.accountId,
      accountName: config.accountName,
      port: config.port,
      storagePrefix: config.storagePrefix,
    });
  });

  // Handle different environments
  let distPath: string;

  if (process.pkg) {
    // When running as a pkg executable
    distPath = path.join(process.execPath, "..", "spa");
  } else {
    // When running normally
    const __dirname = import.meta.dirname;
    distPath = path.join(__dirname, "../spa");
  }

  console.log(`📁 [${config.accountName}] Static files path: ${distPath}`);

  // Serve static files
  app.use(express.static(distPath));

  // Handle React Router - serve index.html for all non-API routes
  app.get("*", (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
      return res.status(404).json({ error: "API endpoint not found" });
    }

    const indexPath = path.join(distPath, "index.html");
    res.sendFile(indexPath);
  });

  return app;
}

export function startAccountServer(config: AccountConfig) {
  const app = createAccountServer(config);

  const server = app.listen(config.port, () => {
    console.log(
      `🏢 ${config.accountName} server running on port ${config.port}`,
    );
    console.log(`📱 Frontend: http://localhost:${config.port}`);
    console.log(`🔧 API: http://localhost:${config.port}/api`);
    console.log(`💾 Storage prefix: ${config.storagePrefix}`);
    console.log(`💻 Executable mode: ${process.pkg ? "YES" : "NO"}`);
    console.log(`${"=".repeat(50)}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log(`🛑 [${config.accountName}] Shutting down gracefully`);
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  return server;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      accountConfig?: AccountConfig;
    }
  }
}
