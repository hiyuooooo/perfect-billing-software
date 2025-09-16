import { defineConfig } from "vite";
import path from "path";

// Multi-server build configuration
export default defineConfig({
  build: {
    lib: {
      entry: {
        "sadhana-server": path.resolve(__dirname, "server/sadhana-server.ts"),
        "himalaya-server": path.resolve(__dirname, "server/himalaya-server.ts"),
      },
      name: "multi-server",
      formats: ["cjs"],
    },
    outDir: "dist/multi-server",
    target: "node22",
    ssr: true,
    rollupOptions: {
      external: [
        // Node.js built-ins
        "fs",
        "path",
        "url",
        "http",
        "https",
        "os",
        "crypto",
        "stream",
        "util",
        "events",
        "buffer",
        "querystring",
        "child_process",
        // External dependencies
        "express",
        "cors",
      ],
      output: {
        format: "cjs",
        entryFileNames: "[name].js",
      },
    },
    minify: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
