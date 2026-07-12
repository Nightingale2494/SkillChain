"use client";
import { AuthProvider } from "@/components/providers/auth-provider";
import { WalletProvider } from "@/components/providers/wallet-provider";
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WalletProvider>{children}</WalletProvider>
    </AuthProvider>
  );
}

