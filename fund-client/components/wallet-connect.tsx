"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  ExternalLink,
  Copy,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const useWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0");
  const [chainId, setChainId] = useState(1);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    checkConnection();
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
        window.ethereum.removeListener("chainChanged", handleChainChanged);
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
          await updateBalance(accounts[0]);
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          setChainId(Number.parseInt(chainId, 16));
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const updateBalance = async (address: string) => {
    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      const balanceInEth = Number.parseInt(balance, 16) / Math.pow(10, 18);
      setBalance(balanceInEth.toFixed(4));
    } catch (error) {
      console.error("Error getting balance:", error);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setIsConnected(false);
      setAddress("");
      setBalance("0");
    } else {
      setAddress(accounts[0]);
      setIsConnected(true);
      updateBalance(accounts[0]);
    }
  };

  const handleChainChanged = (chainId: string) => {
    setChainId(Number.parseInt(chainId, 16));
  };

  const connect = async (walletType: string) => {
    if (walletType === "metamask") {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      setIsConnecting(true);
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
          await updateBalance(accounts[0]);
          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          setChainId(Number.parseInt(chainId, 16));
        }
      } catch (error) {
        console.error("Connection error:", error);
        throw error;
      } finally {
        setIsConnecting(false);
      }
    } else {
      // For other wallets, show installation prompt
      throw new Error(`${walletType} integration coming soon`);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress("");
    setBalance("0");
    setIsConnecting(false);
  };

  return {
    isConnected,
    address,
    balance,
    chainId,
    isConnecting,
    connect,
    disconnect,
  };
};

const walletOptions = [
  {
    name: "MetaMask",
    description: "Connect using browser wallet",
    icon: "🦊",
    id: "metamask",
    installed: typeof window !== "undefined" && !!window.ethereum,
  },
  {
    name: "WalletConnect",
    description: "Connect using mobile wallet",
    icon: "📱",
    id: "walletconnect",
    installed: false,
  },
  {
    name: "Coinbase Wallet",
    description: "Connect using Coinbase",
    icon: "🔵",
    id: "coinbase",
    installed: false,
  },
];

const chainNames: Record<number, string> = {
  1: "Ethereum",
  11155111: "Sepolia",
  137: "Polygon",
  80001: "Mumbai",
  56: "BSC",
  42161: "Arbitrum",
};

const explorerUrls: Record<number, string> = {
  1: "https://etherscan.io/address/",
  11155111: "https://sepolia.etherscan.io/address/",
  137: "https://polygonscan.com/address/",
  80001: "https://mumbai.polygonscan.com/address/",
  56: "https://bscscan.com/address/",
  42161: "https://arbiscan.io/address/",
};

export function WalletConnect() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    isConnected,
    address,
    balance,
    chainId,
    isConnecting,
    connect,
    disconnect,
  } = useWallet();
  const { toast } = useToast();

  const handleConnect = async (walletId: string) => {
    try {
      await connect(walletId);
      setIsOpen(false);
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to your wallet",
      });
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description:
          error.message || "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setIsOpen(false);
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    });
  };

  const viewOnExplorer = () => {
    const explorerUrl = explorerUrls[chainId] || explorerUrls[1];
    window.open(`${explorerUrl}${address}`, "_blank", "noopener,noreferrer");
    toast({
      title: "Opening Explorer",
      description: "View your wallet on the blockchain explorer",
    });
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="bg-transparent">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <Wallet className="w-4 h-4" />
              <span className="hidden sm:inline">{formatAddress(address)}</span>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Wallet Connected
            </DialogTitle>
            <DialogDescription>
              Manage your wallet connection and view details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="border-2 border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Account</CardTitle>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Address
                  </span>
                  <div className="flex items-center justify-between bg-background p-2 rounded-md">
                    <code className="text-sm font-mono">
                      {formatAddress(address)}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyAddress}
                      className="h-7 w-7 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Network
                    </span>
                    <div className="text-sm font-semibold">
                      {chainNames[chainId] || "Unknown"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Balance
                    </span>
                    <div className="text-sm font-semibold">{balance} ETH</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={viewOnExplorer}
                className="flex-1 bg-transparent hover:bg-primary/5"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on Explorer
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnect}
                className="flex-1"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-transparent">
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to FundFlow
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {walletOptions.map((wallet) => (
            <Card
              key={wallet.id}
              className={`cursor-pointer transition-all hover:ring-2 hover:ring-primary/20 ${
                !wallet.installed ? "opacity-50" : ""
              }`}
              onClick={() => wallet.installed && handleConnect(wallet.id)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{wallet.icon}</div>
                  <div>
                    <div className="font-medium">{wallet.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {wallet.description}
                    </div>
                  </div>
                </div>
                {!wallet.installed && (
                  <Badge variant="outline" className="text-xs">
                    Not Installed
                  </Badge>
                )}
                {isConnecting && (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <p className="font-medium mb-1">New to wallets?</p>
              <p>
                A wallet lets you connect to Web3 apps and manage your crypto.
                We recommend starting with MetaMask.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
