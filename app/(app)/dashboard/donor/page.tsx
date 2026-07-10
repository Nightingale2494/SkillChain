import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { FundingChart } from "@/components/dashboard/funding-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { AppShell } from "@/components/shared/app-shell";
import { currentDonor, donations } from "@/lib/mock-data";
export default function DonorDashboard() { const total = donations.reduce((a,d)=>a+d.amount,0); return <AppShell title="Donor portfolio" subtitle="Monitor sponsored students, escrowed capital, releases and impact across your scholarship portfolio."><div className="grid gap-5 md:grid-cols-4"><StatCard label="Total donated" value={`${total} XLM`} detail="Across 2 scholarships"/><StatCard label="Released after proof" value="125 XLM" detail="Registrar-approved"/><StatCard label="Students sponsored" value="2" detail="Nigeria and Mexico"/><StatCard label="Connected wallet" value="Active" detail={currentDonor.wallet}/></div><div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_.8fr]"><FundingChart/><div className="glass rounded-3xl p-6"><h2 className="text-xl font-bold">Impact timeline</h2><div className="mt-4"><ActivityTimeline/></div></div></div></AppShell>; }
