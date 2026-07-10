"use client";
import { WalletProvider } from "@/components/providers/wallet-provider";
export function AppProviders({ children }: { children: React.ReactNode }) { return <WalletProvider>{children}</WalletProvider>; }
