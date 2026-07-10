"use client";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { FundingChart } from "@/components/dashboard/funding-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { AppShell } from "@/components/shared/app-shell";
import { SkeletonGrid } from "@/components/states/skeleton";
import { useWallet } from "@/components/providers/wallet-provider";
import { useStudentScholarships } from "@/lib/hooks/use-scholarships";
export default function StudentDashboard() { const { session } = useWallet(); const { items, loading, error } = useStudentScholarships(session?.publicKey); const raised = items.reduce((a,s)=>a+s.raised,0); return <AppShell title="Student dashboard" subtitle="Track scholarships, milestones, wallet balance and verified releases in one transparent workspace.">{loading ? <SkeletonGrid count={4}/> : error ? <p className="text-red-300">{error}</p> : <><div className="grid gap-5 md:grid-cols-4"><StatCard label="Wallet" value={session ? "Connected" : "Disconnected"} detail={session?.publicKey ?? "Connect wallet"}/><StatCard label="Active scholarships" value={String(items.length)} detail="Live Firestore campaigns"/><StatCard label="Funds raised" value={`${raised} XLM`} detail="Synced from donation events"/><StatCard label="Pending proofs" value={String(items.flatMap(s=>s.milestones).filter(m=>m.status==="pending").length)} detail="Verifier review queue"/></div><div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_.8fr]"><FundingChart/><div className="glass rounded-3xl p-6"><h2 className="text-xl font-bold">Activity</h2><div className="mt-4"><ActivityTimeline/></div></div></div></>}</AppShell>; }
