import path from "path";
import { createServer } from "./index";
import * as express from "express";

const app = createServer();
const port = process.env.PORT || 8080;

// Handle different environments
let distPath: string;

if (process.pkg) {
  // When running as a pkg executable
  // Assets are bundled inside the executable in the snapshot filesystem
  distPath = path.join(process.execPath, "..", "spa");
} else {
  // When running normally
  const __dirname = import.meta.dirname;
  distPath = path.join(__dirname, "../spa");
}

console.log(`📁 Static files path: ${distPath}`);

// Serve static files
app.use(express.static(distPath));

// Handle React Router - serve index.html for all non-API routes
app.get("*", (req, res) => {
  // Don't serve index.html for API routes
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  const indexPath = path.join(distPath, "index.html");
  console.log(`📄 Serving index.html from: ${indexPath}`);
  res.sendFile(indexPath);
});

app.listen(port, () => {
  console.log(`🚀 BillMaster Pro server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
  console.log(`📁 Assets: ${distPath}`);
  console.log(`💻 Executable mode: ${process.pkg ? "YES" : "NO"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
