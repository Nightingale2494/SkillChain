"use client";
import { createContext, useContext, useMemo, useState } from "react";
import { connectors, type WalletSession } from "@/lib/wallet/connectors";
import type { WalletProvider } from "@/lib/types";

type WalletContextValue = { session?: WalletSession; isConnecting: boolean; error?: string; connect(provider: WalletProvider): Promise<void>; disconnect(): void; };
const WalletContext = createContext<WalletContextValue | null>(null);
export function WalletProvider({ children }: { children: React.ReactNode }) {
 const [session, setSession] = useState<WalletSession>(); const [isConnecting, setConnecting] = useState(false); const [error, setError] = useState<string>();
 const value = useMemo<WalletContextValue>(() => ({ session, isConnecting, error, async connect(provider) { setConnecting(true); setError(undefined); try { const connector = connectors.find((c) => c.id === provider); if (!connector) throw new Error("Unsupported wallet"); setSession(await connector.connect()); } catch (e) { setError(e instanceof Error ? e.message : "Wallet connection failed"); } finally { setConnecting(false); } }, disconnect() { setSession(undefined); } }), [session, isConnecting, error]);
 return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
export function useWallet() { const ctx = useContext(WalletContext); if (!ctx) throw new Error("useWallet must be used inside WalletProvider"); return ctx; }
