"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { connectors, type WalletSession } from "@/lib/wallet/connectors";
import type { WalletProvider } from "@/lib/types";
import { useAuth } from "@/components/providers/auth-provider";
import { saveWalletInfo } from "@/lib/services/firestore";

type WalletContextValue = {
  session?: WalletSession;
  isConnecting: boolean;
  error?: string;

  connect(provider: WalletProvider): Promise<void>;
  disconnect(): void;

  sign(xdr: string): Promise<string>;
};

const WalletContext = createContext<WalletContextValue | null>(null);

export function WalletProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [session, setSession] = useState<WalletSession>();
  const [isConnecting, setConnecting] = useState(false);
  const [error, setError] = useState<string>();

  const { user, profile, updateUserProfile } = useAuth();

  // Sync wallet to Firestore user profile and wallets collection when both are active
  useEffect(() => {
    if (user && session?.publicKey) {
      // Check if already in sync to prevent infinite loops
      if (profile && profile.wallet === session.publicKey) {
        return;
      }

      void updateUserProfile({ wallet: session.publicKey });
      void saveWalletInfo(
        session.publicKey,
        user.uid,
        profile?.name || user.displayName || "User",
        profile?.role || "unassigned",
        session.provider
      );
    }
  }, [user, session, profile, updateUserProfile]);


  const value = useMemo<WalletContextValue>(
    () => ({
      session,
      isConnecting,
      error,

      async connect(provider) {
        setConnecting(true);
        setError(undefined);

        try {
          const connector = connectors.find((c) => c.id === provider);

          if (!connector) {
            throw new Error("Unsupported wallet");
          }

          const connectedSession = await connector.connect();
          setSession(connectedSession);
        } catch (e) {
          setError(
            e instanceof Error ? e.message : "Wallet connection failed"
          );
        } finally {
          setConnecting(false);
        }
      },

      disconnect() {
        setSession(undefined);
      },

      async sign(xdr: string) {
        if (!session) {
          throw new Error("Wallet not connected");
        }

        const connector = connectors.find(
          (c) => c.id === session.provider
        );

        if (!connector) {
          throw new Error("Wallet connector not found");
        }

        return connector.sign(xdr);
      },
    }),
    [session, isConnecting, error]
  );

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);

  if (!ctx) {
    throw new Error("useWallet must be used inside WalletProvider");
  }

  return ctx;
}