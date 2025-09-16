import React from "react";
import { Badge } from "@/components/ui/badge";
import { Building2, Globe } from "lucide-react";
import { useAccountDetection } from "@/hooks/use-account-detection";

export function AccountIndicator() {
  const { accountInfo, isLoading } = useAccountDetection();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>Loading account...</span>
      </div>
    );
  }

  if (!accountInfo) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span>Single Account Mode</span>
      </div>
    );
  }

  const getAccountColor = (accountId: string) => {
    switch (accountId) {
      case "sadhana-agency":
        return "bg-blue-500 hover:bg-blue-600";
      case "himalaya-traders":
        return "bg-green-500 hover:bg-green-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Badge
        className={`${getAccountColor(accountInfo.accountId)} text-white font-medium`}
        variant="secondary"
      >
        <Building2 className="h-3 w-3 mr-1" />
        {accountInfo.accountName}
      </Badge>
      <Badge variant="outline" className="text-xs">
        <Globe className="h-3 w-3 mr-1" />
        Port {accountInfo.port}
      </Badge>
    </div>
  );
}

export function AccountBanner() {
  const { accountInfo } = useAccountDetection();

  if (!accountInfo) return null;

  const getAccountGradient = (accountId: string) => {
    switch (accountId) {
      case "sadhana-agency":
        return "from-blue-50 to-blue-100 border-blue-200";
      case "himalaya-traders":
        return "from-green-50 to-green-100 border-green-200";
      default:
        return "from-gray-50 to-gray-100 border-gray-200";
    }
  };

  return (
    <div
      className={`bg-gradient-to-r ${getAccountGradient(accountInfo.accountId)} border-b px-4 py-2`}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-gray-600" />
          <div>
            <h2 className="font-semibold text-gray-800">
              {accountInfo.accountName}
            </h2>
            <p className="text-sm text-gray-600">
              Running on http://localhost:{accountInfo.port}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="bg-white">
          Dedicated Instance
        </Badge>
      </div>
    </div>
  );
}
