import { useEffect, useState } from "react";

interface AccountInfo {
  accountId: string;
  accountName: string;
  port: number;
  storagePrefix: string;
}

export function useAccountDetection() {
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function detectAccount() {
      try {
        const response = await fetch("/api/account-info");
        if (response.ok) {
          const info = await response.json();
          setAccountInfo(info);

          // Set document title to include account name
          document.title = `BillMaster Pro - ${info.accountName}`;

          // Add account-specific styling or data attributes
          document.body.setAttribute("data-account", info.accountId);

          console.log(
            `🏢 Account detected: ${info.accountName} on port ${info.port}`,
          );
        }
      } catch (error) {
        console.log("🔧 Running in development mode or single-account mode");
      } finally {
        setIsLoading(false);
      }
    }

    detectAccount();
  }, []);

  return { accountInfo, isLoading };
}

// Helper hook to get account-specific localStorage key
export function useAccountStorage(key: string) {
  const { accountInfo } = useAccountDetection();

  const getStorageKey = (baseKey: string) => {
    if (accountInfo?.storagePrefix) {
      return `${accountInfo.storagePrefix}${baseKey}`;
    }
    return baseKey; // Fallback for single-account mode
  };

  const getItem = (baseKey: string) => {
    return localStorage.getItem(getStorageKey(baseKey));
  };

  const setItem = (baseKey: string, value: string) => {
    return localStorage.setItem(getStorageKey(baseKey), value);
  };

  const removeItem = (baseKey: string) => {
    return localStorage.removeItem(getStorageKey(baseKey));
  };

  return {
    getItem,
    setItem,
    removeItem,
    getStorageKey,
    accountInfo,
  };
}
