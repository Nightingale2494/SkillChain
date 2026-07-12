"use client";

import { useEffect, useState, useTransition } from "react";
import { Button, Card, Badge } from "@/components/ui";
import { connectors } from "@/lib/wallet/connectors";
import { useWallet } from "@/components/providers/wallet-provider";
import { fetchAccountBalance, fetchRecentTransactions, stellarExplorerUrl } from "@/lib/services/blockchain";
import { Coins, Copy, Check, LogOut, ArrowUpRight, ArrowDownLeft, Clock, ShieldAlert } from "lucide-react";

export function WalletPanel() {
  const { session, connect, disconnect, error, isConnecting } = useWallet();
  const [balance, setBalance] = useState<string>("Loading...");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (session?.publicKey) {
      setLoadingDetails(true);
      Promise.all([
        fetchAccountBalance(session.publicKey),
        fetchRecentTransactions(session.publicKey),
      ])
        .then(([bal, txList]) => {
          setBalance(bal);
          setTransactions(txList);
        })
        .catch((err) => {
          console.error("Error loading wallet details from Horizon:", err);
          setBalance("Error");
        })
        .finally(() => setLoadingDetails(false));
    }
  }, [session]);

  const copyToClipboard = () => {
    if (session?.publicKey) {
      navigator.clipboard.writeText(session.publicKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (session) {
    return (
      <div className="grid gap-6 md:grid-cols-[1fr_1.8fr] animate-in fade-in duration-300">
        {/* LEFT COLUMN: WALLET BALANCE & KEY SUMMARY */}
        <Card className="glass relative overflow-hidden flex flex-col justify-between p-6">
          <div className="absolute top-0 right-0 h-[2px] w-full bg-gradient-to-r from-transparent via-purple/40 to-transparent" />
          
          <div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Active</span>
              <Badge className="bg-green-950/20 text-green border-green/30 capitalize text-[10px]">
                {session.provider}
              </Badge>
            </div>

            {/* LIVE XLM BALANCE CARD */}
            <div className="p-5 rounded-3xl bg-white/5 border border-white/5 relative overflow-hidden">
              <span className="text-slate-400 text-xs block mb-1">Stellar Testnet Balance</span>
              <h3 className="text-3xl font-extrabold text-white flex items-baseline gap-1.5">
                {balance} <span className="text-sm font-semibold text-purple">XLM</span>
              </h3>
              {loadingDetails && (
                <div className="absolute top-2 right-2 size-3 rounded-full bg-purple animate-ping" />
              )}
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Stellar Wallet Public Key</span>
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-black/40 border border-white/5 font-mono text-xs text-slate-300 justify-between">
                  <span className="truncate pr-4">{session.publicKey}</span>
                  <button
                    onClick={copyToClipboard}
                    className="text-slate-400 hover:text-white transition-colors shrink-0"
                  >
                    {copied ? <Check className="size-4 text-green" /> : <Copy className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-2">
                <Clock className="size-3.5" />
                <span>Connected at {new Date(session.connectedAt).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-white/5 pt-5">
            <Button
              variant="secondary"
              onClick={disconnect}
              className="w-full flex items-center justify-center gap-2"
            >
              <LogOut className="size-4" /> Disconnect Wallet
            </Button>
          </div>
        </Card>

        {/* RIGHT COLUMN: RECENT LEDGER TRANSACTIONS */}
        <Card className="glass relative overflow-hidden p-6 flex flex-col">
          <div className="absolute top-0 right-0 h-[2px] w-full bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
          
          <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Coins className="size-5 text-purple" /> Recent Stellar Ledger Payments
            </h3>
            <span className="text-xs text-slate-400 font-medium">Last 5 records</span>
          </div>

          {loadingDetails ? (
            <div className="grid place-items-center py-20 my-auto">
              <div className="size-8 animate-spin rounded-full border-4 border-white/10 border-t-purple" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16 my-auto text-slate-400 text-sm">
              <Coins className="size-10 mx-auto opacity-30 mb-3" />
              No recent payments or ledger activities detected for this address.
            </div>
          ) : (
            <div className="overflow-x-auto my-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-2.5">Flow</th>
                    <th className="py-2.5">Sum</th>
                    <th className="py-2.5">Counterparty</th>
                    <th className="py-2.5 text-right">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {transactions.map((tx) => {
                    const isOutgoing = (tx.from || "").toLowerCase() === (session.publicKey || "").toLowerCase();
                    return (
                      <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 flex items-center gap-2">
                          <span className={`p-1.5 rounded-full ${isOutgoing ? "bg-red-950/20 text-red-400" : "bg-green-950/20 text-green-400"}`}>
                            {isOutgoing ? <ArrowUpRight className="size-3.5" /> : <ArrowDownLeft className="size-3.5" />}
                          </span>
                          <span className="font-semibold text-white capitalize">{tx.type}</span>
                        </td>
                        <td className="py-3 font-semibold text-white">
                          {isOutgoing ? "-" : "+"}{tx.amount} {tx.asset}
                        </td>
                        <td className="py-3 font-mono text-slate-400">
                          {isOutgoing ? `${tx.to.slice(0, 6)}...${tx.to.slice(-4)}` : `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`}
                        </td>
                        <td className="py-3 text-right">
                          <a
                            href={stellarExplorerUrl(tx.txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-cyan hover:text-white transition-colors font-medium"
                          >
                            Explorer <ExternalLink className="size-3" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto animate-in fade-in duration-300">
      <Card className="glass relative overflow-hidden p-8 text-center">
        <div className="absolute top-0 right-0 h-[2px] w-full bg-gradient-to-r from-transparent via-purple/45 to-transparent" />
        
        <div className="inline-flex p-3 rounded-full bg-purple/10 text-purple mb-5">
          <Coins className="size-10 animate-pulse" />
        </div>
        
        <h2 className="text-2xl font-extrabold text-white tracking-wide">Connect a Stellar Wallet</h2>
        <p className="mt-3 text-slate-350 text-sm max-w-md mx-auto leading-relaxed">
          Sponsor scholarships, track milestone funds, and sign smart contract transactions securely using freighter, xBull, or Albedo extensions.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {connectors.map((c) => (
            <Button
              key={c.id}
              variant="secondary"
              onClick={() => connect(c.id)}
              disabled={isConnecting}
              className="py-3 font-semibold hover:-translate-y-0.5 active:scale-95 transition-all text-sm flex items-center justify-center"
            >
              {isConnecting ? "Connecting..." : c.name}
            </Button>
          ))}
        </div>

        {error && (
          <div className="mt-6 p-3 rounded-2xl bg-red-950/20 border border-red-900/30 text-red-300 text-xs flex items-center justify-center gap-2 max-w-sm mx-auto">
            <ShieldAlert className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </Card>
    </div>
  );
}

function ExternalLink({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
      />
    </svg>
  );
}
