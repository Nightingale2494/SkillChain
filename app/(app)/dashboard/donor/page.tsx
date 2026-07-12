"use client";

import { useEffect, useState } from "react";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { FundingChart } from "@/components/dashboard/funding-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { AppShell } from "@/components/shared/app-shell";
import { Card, Button, Badge } from "@/components/ui";
import { listDashboardActivity } from "@/lib/services/dashboard-service";
import { listDonationsForDonor, listScholarships } from "@/lib/services/firestore";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import type { Scholarship, Donation, ActivityItem } from "@/lib/types";
import { Coins, Heart, GraduationCap, Lock, ExternalLink, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function DonorDashboard() {
  const { user, profile, isLoading, updateUserProfile, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [donations, setDonations] = useState<Donation[]>([]);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (profile && profile.role === "donor") {
      setLoadingData(true);
      Promise.all([
        listDonationsForDonor(profile.id),
        listScholarships(),
        listDashboardActivity(),
      ])
        .then(([dList, sList, actList]) => {
          setDonations(dList);
          setScholarships(sList);
          setActivity(actList);
        })
        .catch(err => console.error("Error loading donor data:", err))
        .finally(() => setLoadingData(false));
    }
  }, [profile]);

  if (isLoading) {
    return (
      <AppShell title="Donor portfolio" subtitle="Loading your workspace...">
        <div className="grid place-items-center py-20">
          <div className="size-10 animate-spin rounded-full border-4 border-white/20 border-t-purple" />
        </div>
      </AppShell>
    );
  }

  if (!user || !profile) {
    return (
      <AppShell title="Donor portfolio" subtitle="Sign in to view your dashboard.">
        <div className="max-w-md mx-auto">
          <Card className="text-center py-10 glass animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="inline-flex p-3 rounded-full bg-purple/10 text-purple mb-4">
              <Lock className="size-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Authentication Required</h2>
            <p className="mt-3 text-slate-350 text-sm">
              Please log in using your Google or Email/Password account to access the donor dashboard.
            </p>
            <div className="mt-6">
              <Button onClick={signInWithGoogle} className="shadow-lg shadow-purple/20">Sign in with Google</Button>
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (profile.role !== "donor") {
    return (
      <AppShell
        title="Donor portfolio"
        subtitle="Monitor live donation records, escrow releases and impact across your scholarship portfolio."
      >
        <div className="max-w-md mx-auto">
          <Card className="text-center py-10 glass">
            <div className="inline-flex p-3 rounded-full bg-cyan/10 text-cyan mb-4">
              <Sparkles className="size-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Donor Dashboard Access</h2>
            <p className="mt-3 text-slate-350 text-sm">
              This dashboard is configured for Donor accounts. Your current profile role is{" "}
              <span className="font-semibold text-purple capitalize">"{profile.role}"</span>.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={() => updateUserProfile({ role: "donor" })} className="shadow-lg shadow-purple/20">
                Switch to Donor
              </Button>
              <Button variant="secondary" onClick={() => router.push("/profile")}>
                Configure Profile
              </Button>
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  const total = donations.reduce((sum, donation) => sum + donation.amount, 0);
  const sponsoredScholarships = new Set(donations.map((donation) => donation.scholarshipId)).size;
  const releasedMilestones = scholarships
    .flatMap((scholarship) => scholarship.milestones)
    .filter(
      (milestone) =>
        milestone.status === "released" &&
        donations.some((donation) => donation.scholarshipId === milestone.scholarshipId)
    ).length;

  const sponsoredScholarshipsList = scholarships.filter((s) =>
    donations.some((d) => d.scholarshipId === s.id)
  );

  // Group donations by campaign to calculate cumulative backing amount per scholarship
  const donationsGroupedByCampaign = donations.reduce((acc, curr) => {
    acc[curr.scholarshipId] = (acc[curr.scholarshipId] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AppShell
      title="Donor portfolio"
      subtitle="Monitor live donation records, escrow releases and impact across your scholarship portfolio."
    >
      {loadingData ? (
        <div className="grid place-items-center py-20">
          <div className="size-10 animate-spin rounded-full border-4 border-white/20 border-t-purple" />
        </div>
      ) : (
        <>
          {/* STATISTICS PANEL */}
          <div className="grid gap-5 md:grid-cols-4">
            <StatCard
              label="Total donated"
              value={`${total} XLM`}
              detail="Across your sponsored scholarships"
            />
            <StatCard
              label="Released milestones"
              value={String(releasedMilestones)}
              detail="From your sponsored escrows"
            />
            <StatCard
              label="Scholarships sponsored"
              value={String(sponsoredScholarships)}
              detail="Unique campaigns funded"
            />
            <StatCard
              label="Portfolio owner"
              value={profile.name}
              detail={profile.wallet ? `${profile.wallet.slice(0, 6)}...${profile.wallet.slice(-4)}` : "Wallet not linked"}
            />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            {/* PORTFOLIO LISTING */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white tracking-wide">My Donation Portfolio</h2>

              {sponsoredScholarshipsList.length === 0 ? (
                <Card className="glass text-center py-12">
                  <div className="inline-flex p-3 rounded-full bg-white/5 text-slate-405 mb-4">
                    <Heart className="size-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Your portfolio is empty</h3>
                  <p className="mt-2 text-slate-400 text-sm max-w-sm mx-auto">
                    You haven't supported any campaigns yet. Visit the explorer to find and sponsor talented students.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => router.push("/scholarships")} className="shadow-lg shadow-purple/20">
                      Explore Scholarships
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sponsoredScholarshipsList.map((scholarship) => {
                    const contributedAmount = donationsGroupedByCampaign[scholarship.id] || 0;
                    const totalMilestones = scholarship.milestones.length;
                    const completedMilestones = scholarship.milestones.filter(m => m.status === "released").length;
                    const milestonePercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

                    return (
                      <Card key={scholarship.id} className="glass p-5 relative overflow-hidden flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
                        <div className="absolute top-0 left-0 h-full w-[3px] bg-purple" />
                        
                        <div className="space-y-2">
                          <Badge className="text-[10px] uppercase text-purple border-purple/35 bg-purple/5">
                            {scholarship.category}
                          </Badge>
                          <h3 className="text-lg font-bold text-white flex items-center gap-1.5 hover:text-purple transition-colors">
                            <Link href={`/scholarships/${scholarship.id}`} className="flex items-center gap-1">
                              {scholarship.title} <ExternalLink className="size-3.5 inline-block opacity-60" />
                            </Link>
                          </h3>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                            <span>Student: <strong className="text-white">{scholarship.studentName}</strong></span>
                            <span>University: <strong className="text-white">{scholarship.university}</strong></span>
                          </div>
                        </div>

                        {/* PORTFOLIO METRICS */}
                        <div className="grid grid-cols-2 md:flex items-center gap-6 w-full md:w-auto text-sm">
                          <div>
                            <span className="text-slate-400 text-xs block mb-1">Your Backing</span>
                            <span className="text-purple font-bold flex items-center gap-1">
                              <Coins className="size-4" /> {contributedAmount} XLM
                            </span>
                          </div>
                          
                          <div>
                            <span className="text-slate-400 text-xs block mb-1">Milestones Completed</span>
                            <span className="text-white font-semibold flex items-center gap-1">
                              <CheckCircle2 className="size-4 text-green" /> {completedMilestones} / {totalMilestones}
                            </span>
                          </div>

                          <div className="col-span-2 md:col-span-1 shrink-0">
                            <span className="text-slate-400 text-xs block mb-1">Campaign State</span>
                            <Badge className="bg-cyan-950/20 text-cyan border-cyan/30 capitalize">
                              {scholarship.status.replace("_", " ")}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: GRAPHS & EVENT LOGS */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white tracking-wide">Portfolio Analytics</h2>
              <FundingChart scholarships={sponsoredScholarshipsList} />

              <div className="glass rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-[2px] w-full bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
                <h2 className="text-xl font-bold text-white">Impact timeline</h2>
                <div className="mt-5">
                  <ActivityTimeline
                    items={activity.filter(
                      (a) =>
                        donations.some((d) => a.description.includes(d.scholarshipId)) ||
                        a.kind !== "donation"
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
