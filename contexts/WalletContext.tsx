// contexts/WalletContext.tsx
// Global wallet connection system for NOP Intelligence Layer
"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { API_URL } from "../src/lib/api";

type WalletProvider = "metamask" | "trustwallet" | "coinbase" | "email" | null;

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  provider: WalletProvider;
  connect: (provider: "metamask" | "trustwallet" | "coinbase" | "email", email?: string, referralCode?: string) => Promise<void>;
  disconnect: () => void;
  copyAddress: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const STORAGE_KEY = "nop-wallet-connection";
const STORAGE_PROVIDER_KEY = "nop-wallet-provider";

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<WalletProvider>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Load saved connection on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedAddress = localStorage.getItem(STORAGE_KEY);
    const savedProvider = localStorage.getItem(STORAGE_PROVIDER_KEY) as WalletProvider;

    if (savedAddress && savedProvider) {
      // Try to reconnect
      reconnect(savedProvider, savedAddress);
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!provider || typeof window === "undefined") return;

    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // User disconnected
        disconnect();
      } else if (accounts[0] !== address) {
        // Account changed
        setAddress(accounts[0]);
        localStorage.setItem(STORAGE_KEY, accounts[0]);
      }
    };

    const handleChainChanged = () => {
      // Reload page on chain change (best practice)
      window.location.reload();
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [provider, address]);

  const reconnect = async (savedProvider: WalletProvider, savedAddress: string) => {
    try {
      // Email connections don't need reconnection
      if (savedProvider === "email") {
        setAddress(savedAddress);
        setProvider("email");
        return;
      }

      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        disconnect();
        return;
      }

      // Check if we still have access
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length > 0 && accounts[0].toLowerCase() === savedAddress.toLowerCase()) {
        setAddress(accounts[0]);
        setProvider(savedProvider);
      } else {
        // Lost access, clear storage
        disconnect();
      }
    } catch (error) {
      console.error("Reconnection failed:", error);
      disconnect();
    }
  };

  const connect = useCallback(async (providerType: "metamask" | "trustwallet" | "coinbase" | "email", email?: string, referralCode?: string) => {
    if (isConnecting) return;

    try {
      setIsConnecting(true);

      // Email connection
      if (providerType === "email") {
        if (!email || !email.includes("@")) {
          throw new Error("Please enter a valid email address.");
        }
        // For email, we'll use a mock address or generate one from email
        // In production, this would trigger an email verification flow
        const mockAddress = `0x${email.split("@")[0].slice(0, 8).padEnd(40, "0")}`;
        setAddress(mockAddress);
        setProvider("email");
        localStorage.setItem(STORAGE_KEY, mockAddress);
        localStorage.setItem(STORAGE_PROVIDER_KEY, "email");
        localStorage.setItem("nop-wallet-email", email);

        // Register with referral code if provided
        if (referralCode) {
          try {
            await fetch(`${API_URL}/api/referral/register`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                address: mockAddress,
                referralCode: referralCode.toUpperCase(),
              }),
            });
          } catch (refError) {
            console.error("Referral registration failed:", refError);
            // Don't throw - connection succeeded, referral is optional
          }
        }
        return;
      }

      // Wallet connections (MetaMask, Trust Wallet, Coinbase)
      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        throw new Error("No wallet provider found. Please install a wallet extension.");
      }

      // Request account access
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      if (accounts.length === 0) {
        throw new Error("No accounts found. Please unlock your wallet.");
      }

      const account = accounts[0];
      setAddress(account);
      setProvider(providerType);

      // Persist connection
      localStorage.setItem(STORAGE_KEY, account);
      localStorage.setItem(STORAGE_PROVIDER_KEY, providerType);

        // Register with referral code if provided
        if (referralCode) {
          try {
            await fetch(`${API_URL}/api/referral/register`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                address: account,
                referralCode: referralCode.toUpperCase(),
              }),
            });
          } catch (refError) {
            console.error("Referral registration failed:", refError);
            // Don't throw - connection succeeded, referral is optional
          }
        }
    } catch (error: any) {
      console.error("Wallet connection error:", error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setProvider(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_PROVIDER_KEY);
    localStorage.removeItem("nop-wallet-email");
  }, []);

  const copyAddress = useCallback(async () => {
    if (!address) return;

    try {
      await navigator.clipboard.writeText(address);
      // You could show a toast here
    } catch (error) {
      console.error("Failed to copy address:", error);
    }
  }, [address]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        provider,
        connect,
        disconnect,
        copyAddress,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

