import { startAccountServer } from "./multi-instance";

// Sadhana Agency Configuration
const sadhanaConfig = {
  accountId: "sadhana-agency",
  accountName: "Sadhana Agency",
  port: 8080,
  storagePrefix: "sadhana_",
};

console.log("🚀 Starting Sadhana Agency Instance...");
console.log("=".repeat(50));

startAccountServer(sadhanaConfig);
