import { startAccountServer } from "./multi-instance";

// Himalaya Traders Configuration
const himalayaConfig = {
  accountId: "himalaya-traders",
  accountName: "Himalaya Traders",
  port: 8081,
  storagePrefix: "himalaya_",
};

console.log("🚀 Starting Himalaya Traders Instance...");
console.log("=".repeat(50));

startAccountServer(himalayaConfig);
