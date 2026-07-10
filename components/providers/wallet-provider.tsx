"use client";
import { createContext, useContext, useMemo, useState } from "react";
import { connectorFor, connectors, type WalletSession } from "@/lib/wallet/connectors";
import type { WalletProvider } from "@/lib/types";

type WalletContextValue = { session?: WalletSession; available: WalletProvider[]; isConnecting: boolean; error?: string; connect(provider: WalletProvider): Promise<void>; sign(xdr: string): Promise<string>; disconnect(): void; };
const WalletContext = createContext<WalletContextValue | null>(null);
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<WalletSession>();
  const [isConnecting, setConnecting] = useState(false);
  const [error, setError] = useState<string>();
  const available = typeof window === "undefined" ? [] : connectors.filter((connector) => connector.detect()).map((connector) => connector.id);
  const value = useMemo<WalletContextValue>(() => ({ session, available, isConnecting, error, async connect(provider) { setConnecting(true); setError(undefined); try { setSession(await connectorFor(provider).connect()); } catch (e) { setError(e instanceof Error ? e.message : "Wallet connection failed"); throw e; } finally { setConnecting(false); } }, async sign(xdr) { if (!session) throw new Error("Connect a wallet before signing"); return connectorFor(session.provider).sign(xdr); }, disconnect() { setSession(undefined); } }), [session, available, isConnecting, error]);
  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}
export function useWallet() { const ctx = useContext(WalletContext); if (!ctx) throw new Error("useWallet must be used inside WalletProvider"); return ctx; }
