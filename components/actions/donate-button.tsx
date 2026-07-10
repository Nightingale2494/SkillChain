"use client";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui";
import { useWallet } from "@/components/providers/wallet-provider";
import { buildDonationTransaction, submitSignedTransaction } from "@/lib/soroban/client";
import { recordDonation } from "@/lib/services/scholarship-service";
export function DonateButton({ scholarshipId, numericId, amount }: { scholarshipId: string; numericId: number; amount: number }) { const { session, sign } = useWallet(); const [error,setError]=useState<string>(); const [isPending,startTransition]=useTransition(); const donate=()=>startTransition(()=>{ void (async()=>{ try { if(!session) throw new Error("Connect a wallet first"); const tx=await buildDonationTransaction({ donor: session.publicKey, scholarshipId: numericId, amount, asset: "XLM" }); const signed=await sign(tx.xdr); const result=await submitSignedTransaction(signed); await recordDonation({ scholarshipId, donorId: session.publicKey, donorName: session.publicKey.slice(0,8), amount, asset: "XLM", txHash: result.hash }); } catch(e){ setError(e instanceof Error ? e.message : "Donation failed"); } })(); }); return <div><Button disabled={isPending} onClick={donate}>{isPending ? "Signing donation…" : `Donate ${amount} XLM`}</Button>{error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}</div>; }
