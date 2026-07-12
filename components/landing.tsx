import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Eye,
  Cpu,
  Globe,
  Coins,
  Users,
  Award,
} from "lucide-react";

import { Badge, Button, Card } from "@/components/ui";
import { listScholarships } from "@/lib/services/firestore";
import { formatter } from "@/lib/utils";
import { LandingNavbar } from "@/components/landing-navbar";

export async function LandingPage() {
  const scholarships = await listScholarships();
  const featuredScholarship = scholarships[0];
  const totalRaised = scholarships.reduce((sum, scholarship) => sum + scholarship.raised, 0);
  const totalGoal = scholarships.reduce((sum, scholarship) => sum + scholarship.goal, 0);
  const fundingPercent = totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0;
  const featuredPercent = featuredScholarship && featuredScholarship.goal > 0
    ? Math.round((featuredScholarship.raised / featuredScholarship.goal) * 100)
    : 0;
  const featuredMilestones = featuredScholarship?.milestones.slice(0, 3) ?? [];

  return (
    <main className="min-h-screen overflow-hidden ambient-bg">
      <div className="absolute inset-0 bg-grid bg-[length:48px_48px] opacity-20 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 py-6 lg:px-8 space-y-12">
        <LandingNavbar />

        {/* Hero Section */}
        <section className="grid items-center gap-12 py-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Badge className="border-stellar/20 bg-stellar/5 text-stellar">
              Powered by Stellar Blockchain
            </Badge>

            <h1 className="text-5xl font-black tracking-tight md:text-7xl leading-[1.08] text-white">
              <span className="gradient-text">
                Transparent Scholarships.
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-stellar via-[#a855f7] to-aqua">
                Limitless Futures.
              </span>
            </h1>

            <p className="max-w-xl text-md leading-relaxed text-slate-300">
              A decentralized platform where students, donors, and organizations come together to fund education transparently and create lasting impact.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link href="/scholarships">
                <Button className="flex items-center gap-2">
                  Explore Scholarships
                  <ArrowRight className="size-4" />
                </Button>
              </Link>

              <Link href="/scholarships/create">
                <Button variant="secondary" className="flex items-center gap-2">
                  <span className="inline-block size-2 rounded-full bg-mint animate-pulse" />
                  How It Works
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive Hero Widget and Floating Stats */}
          <div className="relative lg:pl-4">
            
            {/* Floating Stat 1: Top-Right */}
            <div className="absolute -top-6 right-2 md:-right-6 z-10 glass px-4 py-3 rounded-2xl flex items-center gap-3 shadow-glow transition-transform hover:-translate-y-0.5 pointer-events-none">
              <div className="grid size-8 place-items-center rounded-xl bg-stellar/10 text-stellar">
                <Award className="size-4.5" />
              </div>
              <div>
                <p className="text-sm font-black text-white leading-none">45K+</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Students Empowered</p>
              </div>
            </div>

            {/* Floating Stat 2: Middle-Left */}
            <div className="absolute top-[40%] -left-4 md:-left-10 z-10 glass px-4 py-3 rounded-2xl flex items-center gap-3 shadow-glow transition-transform hover:-translate-y-0.5 pointer-events-none">
              <div className="grid size-8 place-items-center rounded-xl bg-aqua/10 text-aqua">
                <Users className="size-4.5" />
              </div>
              <div>
                <p className="text-sm font-black text-white leading-none">12K+</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Active Donors</p>
              </div>
            </div>

            {/* Floating Stat 3: Bottom-Right */}
            <div className="absolute -bottom-6 right-2 md:right-4 z-10 glass px-4 py-3 rounded-2xl flex items-center gap-3 shadow-glow transition-transform hover:-translate-y-0.5 pointer-events-none">
              <div className="grid size-8 place-items-center rounded-xl bg-mint/10 text-mint">
                <Coins className="size-4.5" />
              </div>
              <div>
                <p className="text-sm font-black text-white leading-none">$2.3M+</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Funds Disbursed</p>
              </div>
            </div>

            {/* Main Featured Scholarship Card */}
            <Card className="p-5 border border-white/5 bg-[#090d16]/75 shadow-glow relative z-0">
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <div className="flex items-center justify-between">
                  <Badge className="border-mint/30 bg-mint/5 text-mint">Live scholarship feed</Badge>
                  <span className="text-xs font-mono text-aqua">
                    {scholarships.length ? `${scholarships.length} Campaigns` : "0 records"}
                  </span>
                </div>

                <h2 className="mt-5 text-xl font-extrabold text-white">
                  {featuredScholarship?.studentName ?? "No live scholarship data"}
                </h2>

                <p className="mt-1.5 text-xs text-slate-300 leading-normal line-clamp-2">
                  {featuredScholarship?.title ?? "Connect Firestore to populate the hero card."}
                </p>

                <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-stellar via-purple-500 to-mint transition-all duration-500"
                    style={{ width: `${featuredPercent}%` }}
                  />
                </div>

                <div className="mt-2.5 flex justify-between text-xs text-slate-400 font-mono">
                  <span>
                    {featuredScholarship
                      ? `${formatter.format(featuredScholarship.raised)} / ${formatter.format(featuredScholarship.goal)} XLM`
                      : "0 / 0 XLM"}
                  </span>
                  <span>{featuredPercent}%</span>
                </div>

                {/* Micro Milestones preview */}
                <div className="mt-6 space-y-2">
                  {featuredMilestones.map((milestone) => (
                    <div
                      key={milestone.id}
                      className="flex items-center justify-between rounded-xl bg-ink/30 px-3.5 py-2.5 border border-white/5 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-white leading-none">{milestone.title}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Verifier: {milestone.verifier}
                        </p>
                      </div>

                      <Badge
                        className={`text-[10px] py-0 px-2 uppercase ${
                          milestone.status === "approved" || milestone.status === "released"
                            ? "border-mint/30 bg-mint/10 text-mint"
                            : "border-slate-500/20 bg-slate-500/5 text-slate-300"
                        }`}
                      >
                        {milestone.status}
                      </Badge>
                    </div>
                  ))}

                  {!featuredMilestones.length && (
                    <div className="rounded-xl bg-ink/30 p-4 text-center text-xs text-slate-400 border border-white/5">
                      Milestone feed will populate on campaign creation.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 py-8">
          <div className="glass p-5 rounded-2xl flex items-start gap-4">
            <div className="grid size-10 place-items-center rounded-xl bg-stellar/10 text-stellar shrink-0">
              <Shield className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Blockchain Security</h3>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                Every transaction is cryptographically recorded and verified on Stellar.
              </p>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl flex items-start gap-4">
            <div className="grid size-10 place-items-center rounded-xl bg-aqua/10 text-aqua shrink-0">
              <Eye className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Transparent Tracking</h3>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                Track every scholarship milestone payment from funding to release in real-time.
              </p>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl flex items-start gap-4">
            <div className="grid size-10 place-items-center rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
              <Cpu className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Smart Escrows</h3>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                Milestones trigger escrow release transactions automatically after proof validation.
              </p>
            </div>
          </div>

          <div className="glass p-5 rounded-2xl flex items-start gap-4">
            <div className="grid size-10 place-items-center rounded-xl bg-mint/10 text-mint shrink-0">
              <Globe className="size-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Global Reach</h3>
              <p className="text-xs text-slate-400 mt-1 leading-normal">
                Sponsor students worldwide directly with low blockchain settlement fees.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}