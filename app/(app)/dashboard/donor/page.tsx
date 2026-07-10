"use client";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { FundingChart } from "@/components/dashboard/funding-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { AppShell } from "@/components/shared/app-shell";
import { SkeletonGrid } from "@/components/states/skeleton";
import { useWallet } from "@/components/providers/wallet-provider";
import { useDonorDonations } from "@/lib/hooks/use-scholarships";
export default function DonorDashboard() { const { session } = useWallet(); const { items, loading, error } = useDonorDonations(session?.publicKey); const total = items.reduce((a,d)=>a+d.amount,0); return <AppShell title="Donor portfolio" subtitle="Monitor sponsored students, escrowed capital, releases and impact across your scholarship portfolio.">{loading ? <SkeletonGrid count={4}/> : error ? <p className="text-red-300">{error}</p> : <><div className="grid gap-5 md:grid-cols-4"><StatCard label="Total donated" value={`${total} XLM`} detail="Live donor history"/><StatCard label="Transactions" value={String(items.length)} detail="Stellar Testnet submissions"/><StatCard label="Students sponsored" value={String(new Set(items.map(d=>d.scholarshipId)).size)} detail="Unique campaigns"/><StatCard label="Connected wallet" value={session ? "Active" : "Disconnected"} detail={session?.publicKey ?? "Connect wallet"}/></div><div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_.8fr]"><FundingChart/><div className="glass rounded-3xl p-6"><h2 className="text-xl font-bold">Impact timeline</h2><div className="mt-4"><ActivityTimeline/></div></div></div></>}</AppShell>; }
