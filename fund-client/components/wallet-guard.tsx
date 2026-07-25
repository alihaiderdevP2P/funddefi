"use client";

import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WalletConnect } from "./wallet-connect";
import { Wallet, Shield } from "lucide-react";
import { useState, useEffect } from "react";

const useWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");

  useEffect(() => {
    checkConnection();
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, []);

  const checkConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAddress("");
    } else {
      setAddress(accounts[0]);
      setIsConnected(true);
    }
  };

  return {
    isConnected,
    address,
  };
};

interface WalletGuardProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export function WalletGuard({
  children,
  title,
  description,
}: WalletGuardProps) {
  const { isConnected } = useWallet();

  if (!isConnected) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>{title || "Connect Your Wallet"}</CardTitle>
            <CardDescription>
              {description ||
                "You need to connect your wallet to access this feature"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <WalletConnect />
            <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
              <Shield className="w-3 h-3" />
              <span>Secure connection via Web3</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
