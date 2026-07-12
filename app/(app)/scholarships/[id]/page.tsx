import { notFound } from "next/navigation";
import { Badge, Card } from "@/components/ui";
import { AppShell } from "@/components/shared/app-shell";
import { DonateButton } from "@/components/actions/donate-button";
import { listScholarships, listDonations, listMilestoneReviews } from "@/lib/services/firestore";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { Coins, GraduationCap, MapPin, Calendar, Clock, CheckCircle2, User, FileText, ExternalLink, Lock, AlertCircle } from "lucide-react";
import type { ActivityItem } from "@/lib/types";

export default async function ScholarshipDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scholarships = await listScholarships();
  const scholarship = scholarships.find((item) => item.id === id);

  if (!scholarship) {
    notFound();
  }

  // Fetch campaign activities
  const allDonations = await listDonations();
  const scholarshipDonations = allDonations.filter((d) => d.scholarshipId === id);
  const scholarshipReviews = await listMilestoneReviews(id);

  // Group donations to get unique sponsor count
  const uniqueSponsorCount = new Set(scholarshipDonations.map((d) => d.donorUid).filter(Boolean)).size;

  // Process timeline events
  const donationEvents: ActivityItem[] = scholarshipDonations.map((d) => ({
    id: d.id,
    kind: "donation",
    title: `${d.donorName} donated ${d.amount} ${d.asset}`,
    description: d.txHash ? `Tx: ${d.txHash.slice(0, 8)}...${d.txHash.slice(-4)}` : "Donation pending",
    timestamp: d.createdAt,
  }));

  const reviewEvents: ActivityItem[] = scholarshipReviews.map((r) => {
    let rawDate = new Date();
    if (r.createdAt && typeof r.createdAt === "object" && "toDate" in r.createdAt) {
      rawDate = (r.createdAt as { toDate: () => Date }).toDate();
    } else if (r.createdAt) {
      rawDate = new Date(r.createdAt);
    }
    
    return {
      id: r.id,
      kind: r.status === "released" ? "release" : "milestone",
      title: `Milestone #${r.milestoneId} - status updated to ${r.status}`,
      description: r.feedback || "Approved and resolved on Stellar Testnet",
      timestamp: rawDate.toISOString(),
    };
  });

  const timelineItems = [...donationEvents, ...reviewEvents].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const pct = Math.round((scholarship.raised / scholarship.goal) * 100);

  // Calculate days remaining
  const deadlineDate = new Date(scholarship.deadline);
  const diffTime = deadlineDate.getTime() - Date.now();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <AppShell title={scholarship.title} subtitle={`${scholarship.university} • ${scholarship.country}`}>
      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] animate-in fade-in duration-300">
        
        {/* LEFT COLUMN: DESCRIPTION, ROADMAP, DOCUMENT TABS */}
        <div className="space-y-8">
          {/* CORE OVERVIEW */}
          <Card className="glass relative overflow-hidden p-6">
            <div className="absolute top-0 left-0 h-full w-[3px] bg-purple" />
            <div className="flex flex-wrap gap-2.5">
              <Badge className="bg-purple/10 text-purple border-purple/30 uppercase text-[10px] tracking-wider">
                {scholarship.category}
              </Badge>
              <Badge className="bg-cyan/10 text-cyan border-cyan/30 capitalize text-[10px] tracking-wider">
                {scholarship.status.replace("_", " ")}
              </Badge>
            </div>
            
            <h2 className="mt-5 text-xl font-extrabold text-white">Campaign Slogan & Outline</h2>
            <p className="mt-3 text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {scholarship.description}
            </p>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 border-t border-white/5 pt-5 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Student Candidate</span>
                <span className="font-semibold text-white flex items-center gap-1">
                  <User className="size-3.5 text-purple" /> {scholarship.studentName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Target University</span>
                <span className="font-semibold text-white flex items-center gap-1">
                  <GraduationCap className="size-3.5 text-purple" /> {scholarship.university}
                </span>
              </div>
              <div className="col-span-2 md:col-span-1">
                <span className="text-slate-400 block mb-1">Region</span>
                <span className="font-semibold text-white flex items-center gap-1">
                  <MapPin className="size-3.5 text-purple" /> {scholarship.country}
                </span>
              </div>
            </div>
          </Card>

          {/* ROADMAP TIMELINE */}
          <Card className="glass p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="size-5 text-purple" /> Academic Milestone Roadmap
            </h2>
            
            <div className="space-y-5">
              {scholarship.milestones.map((milestone, idx) => (
                <div key={milestone.id} className="relative pl-6 border-l border-white/10 last:border-transparent pb-4">
                  {/* Vertical line dot */}
                  <div className={`absolute -left-1.5 top-1 size-3 rounded-full border ${
                    milestone.status === "released" 
                      ? "bg-green border-green-500" 
                      : milestone.status === "pending" 
                        ? "bg-yellow-500 border-yellow-400 animate-pulse" 
                        : "bg-slate-800 border-slate-700"
                  }`} />

                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Milestone #{idx + 1}</span>
                        <h4 className="font-bold text-white text-sm">{milestone.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Disbursement: <strong className="text-purple">{milestone.amount} XLM</strong> • Due by {new Date(milestone.dueDate).toLocaleDateString()}
                      </p>
                      
                      {milestone.feedback && (
                        <p className="mt-2 text-xs text-red-300 bg-red-950/20 border border-red-900/30 rounded-xl p-2 flex items-start gap-1.5">
                          <AlertCircle className="size-3.5 shrink-0 mt-0.5" />
                          <span>{milestone.feedback}</span>
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                      {milestone.status === "locked" && (
                        <Badge className="bg-slate-800 text-slate-400 border-slate-700/50 flex items-center gap-1 text-[10px]">
                          <Lock className="size-3" /> Locked
                        </Badge>
                      )}
                      {milestone.status === "pending" && (
                        <Badge className="bg-yellow-950/20 text-yellow-400 border-yellow-900/30 flex items-center gap-1 text-[10px]">
                          <Clock className="size-3" /> In Review
                        </Badge>
                      )}
                      {milestone.status === "released" && (
                        <Badge className="bg-green-950/20 text-green border-green/30 flex items-center gap-1 text-[10px]">
                          <CheckCircle2 className="size-3" /> Released
                        </Badge>
                      )}

                      {milestone.proofUrl && (
                        <a
                          href={milestone.proofUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded-lg bg-white/5 border border-white/5 text-cyan hover:text-white transition-colors"
                          title="View submitted document"
                        >
                          <FileText className="size-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: DONATIONS PANEL, METRICS & AUDIT FEED */}
        <div className="space-y-8">
          {/* CROWDFUNDING PANEL */}
          <Card className="glass relative overflow-hidden p-6">
            <div className="absolute top-0 right-0 h-[2px] w-full bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
            
            <div className="space-y-4">
              <div>
                <span className="text-xs text-slate-400 block mb-1">Stellar Escrow Contract</span>
                <span className="font-mono text-xs text-cyan tracking-wider truncate block bg-black/40 p-2.5 rounded-2xl border border-white/5">
                  {scholarship.escrowContract ? scholarship.escrowContract : "Contract deployment pending"}
                </span>
              </div>

              {/* PROGRESS BAR */}
              <div className="mt-6">
                <div className="flex justify-between items-baseline text-sm mb-1.5">
                  <span className="text-slate-350">Goal Reached</span>
                  <span className="text-white font-extrabold text-base">{scholarship.raised} / {scholarship.goal} XLM ({pct}%)</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple via-cyan to-green h-3 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4 text-center">
                <div className="border-r border-white/5">
                  <span className="text-slate-400 text-[10px] uppercase block mb-0.5">Sponsors</span>
                  <span className="text-white font-extrabold text-base">{uniqueSponsorCount} Backers</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase block mb-0.5">Time Limit</span>
                  <span className="text-white font-extrabold text-base">{daysLeft > 0 ? `${daysLeft} Days left` : "Ended"}</span>
                </div>
              </div>

              <div className="border-t border-white/5 pt-5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Back this Scholarship</h3>
                <DonateButton
                  scholarshipId={scholarship.id}
                  scholarshipChainId={scholarship.chainId}
                />
              </div>
            </div>
          </Card>

          {/* DYNAMIC AUDIT FEED */}
          <Card className="glass p-6">
            <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Coins className="size-4.5 text-purple" /> Campaign Timeline Log
            </h2>
            <div className="max-h-[350px] overflow-y-auto pr-1">
              {timelineItems.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No payment or verification logs registered yet. Be the first backer!
                </div>
              ) : (
                <ActivityTimeline items={timelineItems} />
              )}
            </div>
          </Card>
        </div>

      </div>
    </AppShell>
  );
}
