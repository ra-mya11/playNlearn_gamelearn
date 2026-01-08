import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";

/**
 * Global Wallet Context
 * Maintains consistent EduCoins state across the entire application
 * Fixed values:
 * - Earned = 1200 (fixed amount)
 * - Spent = dynamically tracked from redemptions
 * - Balance = Earned - Spent
 */

interface WalletContextType {
  earned: number;
  spent: number;
  balance: number;
  transactions: Array<{
    id: string;
    amount: number;
    type: "earn" | "spend";
    description: string;
    timestamp: Date;
  }>;
  updateSpent: (amount: number) => void;
  addTransaction: (amount: number, type: "earn" | "spend", description: string) => void;
  refreshWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const FIXED_EARNED_AMOUNT = 1200; // Fixed earned coins

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [earned, setEarned] = useState(0);
  const [spent, setSpent] = useState(0);
  const [transactions, setTransactions] = useState<WalletContextType["transactions"]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // One-time cleanup of all wallet data
  useEffect(() => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('wallet_')) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  // Reset state immediately when user changes
  useEffect(() => {
    if (currentUserId !== user?.id) {
      setEarned(user?.id ? FIXED_EARNED_AMOUNT : 0);
      setSpent(0);
      setTransactions([]);
      setCurrentUserId(user?.id || null);
    }
  }, [user?.id, currentUserId]);

  // Initialize wallet from localStorage after reset
  useEffect(() => {
    if (!user?.id) return;

    const storageKey = `wallet_${user.id}`;
    const savedWallet = localStorage.getItem(storageKey);

    if (savedWallet) {
      try {
        const { earned: savedEarned, spent: savedSpent, transactions: savedTransactions } = JSON.parse(savedWallet);
        setEarned(savedEarned || FIXED_EARNED_AMOUNT);
        setSpent(savedSpent || 0);
        setTransactions(
          (savedTransactions || []).map((tx: any) => ({
            ...tx,
            timestamp: new Date(tx.timestamp),
          }))
        );
      } catch (error) {
        console.error("Error loading wallet from localStorage:", error);
      }
    } else {
      // Set default earned amount for new users
      setEarned(FIXED_EARNED_AMOUNT);
    }
  }, [currentUserId]);

  // Persist wallet to localStorage whenever it changes
  useEffect(() => {
    if (!user?.id) return;

    const storageKey = `wallet_${user.id}`;
    const walletData = {
      earned,
      spent,
      transactions: transactions.map((tx) => ({
        ...tx,
        timestamp: tx.timestamp.toISOString(),
      })),
    };

    localStorage.setItem(storageKey, JSON.stringify(walletData));
  }, [user?.id, earned, spent, transactions]);

  const balance = earned - spent;

  const updateSpent = (amount: number) => {
    setSpent((prev) => prev + amount);
  };

  const addTransaction = (amount: number, type: "earn" | "spend", description: string) => {
    const newTransaction: WalletContextType["transactions"][0] = {
      id: `tx_${Date.now()}_${Math.random()}`,
      amount,
      type,
      description,
      timestamp: new Date(),
    };

    setTransactions((prev) => [newTransaction, ...prev]);

    if (type === "spend") {
      updateSpent(amount);
    }
  };

  const refreshWallet = () => {
    if (!user?.id) return;
    
    const storageKey = `wallet_${user.id}`;
    const savedWallet = localStorage.getItem(storageKey);
    
    if (savedWallet) {
      try {
        const { earned: savedEarned, spent: savedSpent, transactions: savedTransactions } = JSON.parse(savedWallet);
        setEarned(savedEarned || FIXED_EARNED_AMOUNT);
        setSpent(savedSpent || 0);
        setTransactions(
          (savedTransactions || []).map((tx: any) => ({
            ...tx,
            timestamp: new Date(tx.timestamp),
          }))
        );
      } catch (error) {
        console.error('Error refreshing wallet:', error);
      }
    }
  };

  return (
    <WalletContext.Provider
      value={{
        earned,
        spent,
        balance,
        transactions,
        updateSpent,
        addTransaction,
        refreshWallet,
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
