"use client";

import { useEffect, useState } from "react";
import { Badge, Card, Button } from "@/components/ui";
import { AppShell } from "@/components/shared/app-shell";
import { listScholarships } from "@/lib/services/firestore";
import { useAuth } from "@/components/providers/auth-provider";
import { MilestoneActions } from "@/components/actions/milestone-actions";
import type { Scholarship } from "@/lib/types";
import { Clock, CheckCircle2, ShieldAlert, Sparkles, FileText, ExternalLink, Calendar, User } from "lucide-react";

interface FlattenedMilestone {
  id: string;
  scholarshipId: string;
  title: string;
  amount: number;
  dueDate: string;
  verifier: string;
  status: string;
  proofUrl?: string;
  txHash?: string;
  feedback?: string;
  scholarship: string;
  student: string;
  studentWallet: string;
  scholarshipChainId: number;
}

export default function MilestonesPage() {
  const { user, profile, isLoading, signInWithGoogle } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "released">("pending");

  useEffect(() => {
    setLoadingData(true);
    listScholarships()
      .then((list) => setScholarships(list))
      .catch(err => console.error("Error loading milestones:", err))
      .finally(() => setLoadingData(false));
  }, []);

  if (isLoading) {
    return (
      <AppShell title="Verification desk" subtitle="Loading milestones workspace...">
        <div className="grid place-items-center py-20">
          <div className="size-10 animate-spin rounded-full border-4 border-white/20 border-t-purple" />
        </div>
      </AppShell>
    );
  }

  if (!user || !profile) {
    return (
      <AppShell title="Verification desk" subtitle="Sign in to view academic milestones.">
        <div className="max-w-md mx-auto">
          <Card className="text-center py-10 glass animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="inline-flex p-3 rounded-full bg-purple/10 text-purple mb-4">
              <ShieldAlert className="size-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Authentication Required</h2>
            <p className="mt-3 text-slate-350 text-sm">
              Please log in using your Google or Email/Password account to view the milestone verification panel.
            </p>
            <div className="mt-6">
              <Button onClick={signInWithGoogle} className="shadow-lg shadow-purple/20">Sign in with Google</Button>
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  // Role Gate: Only NGO, University, and Admin profiles can verify milestones
  const isVerifier = ["ngo", "university", "admin"].includes(profile.role);

  if (!isVerifier) {
    return (
      <AppShell title="Verification desk" subtitle="Authorized verifier workspace.">
        <div className="max-w-md mx-auto">
          <Card className="text-center py-10 glass">
            <div className="inline-flex p-3 rounded-full bg-red-950/20 text-red-400 mb-4 border border-red-900/30">
              <ShieldAlert className="size-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Unauthorized Access</h2>
            <p className="mt-3 text-slate-350 text-sm">
              This panel is gated for authorized **NGO Partners** and **Academic Institutions** only. Your current role is <span className="text-purple capitalize font-semibold">"{profile.role}"</span>.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              If you are a student or donor, please navigate to your respective dashboards from the sidebar.
            </p>
          </Card>
        </div>
      </AppShell>
    );
  }

  // Flatten milestones across all campaigns
  const milestones: FlattenedMilestone[] = scholarships.flatMap((scholarship) =>
    scholarship.milestones.map((milestone) => ({
      ...milestone,
      scholarship: scholarship.title,
      student: scholarship.studentName,
      studentWallet: scholarship.studentWallet,
      scholarshipChainId: scholarship.chainId,
    }))
  );

  // Split milestones by status
  const pendingMilestones = milestones.filter(m => m.status === "pending");
  const releasedMilestones = milestones.filter(m => m.status === "released");

  return (
    <AppShell
      title="Verification desk"
      subtitle="Review proofs, approve or reject submissions, and trigger Soroban escrow releases after academic validation."
    >
      {/* SELECTION TABS */}
      <div className="flex gap-4 border-b border-white/5 pb-3 mb-6">
        <button
          onClick={() => setActiveTab("pending")}
          className={`pb-2 px-2 text-sm font-semibold tracking-wide border-b-2 transition-all relative ${
            activeTab === "pending"
              ? "text-purple border-purple font-bold"
              : "text-slate-400 border-transparent hover:text-white"
          }`}
        >
          Active Verification Queue
          {pendingMilestones.length > 0 && (
            <span className="absolute -top-1.5 -right-3 text-[10px] bg-purple text-white rounded-full size-4 flex items-center justify-center font-bold">
              {pendingMilestones.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("released")}
          className={`pb-2 px-2 text-sm font-semibold tracking-wide border-b-2 transition-all ${
            activeTab === "released"
              ? "text-purple border-purple font-bold"
              : "text-slate-400 border-transparent hover:text-white"
          }`}
        >
          Historical Settlement Log ({releasedMilestones.length})
        </button>
      </div>

      {loadingData ? (
        <div className="grid place-items-center py-20">
          <div className="size-10 animate-spin rounded-full border-4 border-white/20 border-t-purple" />
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === "pending" ? (
            pendingMilestones.length === 0 ? (
              <Card className="glass text-center py-16">
                <div className="inline-flex p-3 rounded-full bg-white/5 text-slate-405 mb-4">
                  <CheckCircle2 className="size-8 text-green" />
                </div>
                <h3 className="text-xl font-semibold text-white">Queue Cleared</h3>
                <p className="mt-2 text-slate-400 text-sm max-w-sm mx-auto">
                  There are no pending milestones awaiting academic verification.
                </p>
              </Card>
            ) : (
              pendingMilestones.map((milestone) => {
                const numericId = Number(milestone.id.replace(/\D/g, "") || "1");
                return (
                  <Card key={`${milestone.scholarshipId}-${milestone.id}`} className="glass p-6 relative overflow-hidden flex flex-col lg:flex-row justify-between gap-6 items-stretch lg:items-center">
                    <div className="absolute top-0 left-0 h-full w-[3px] bg-yellow-500" />
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-950/20 text-yellow-400 border-yellow-900/30 flex items-center gap-1 text-[10px]">
                          <Clock className="size-3 animate-pulse" /> Awaiting Action
                        </Badge>
                        <span className="text-xs text-slate-400">• Requested amount: <strong className="text-white">{milestone.amount} XLM</strong></span>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-white">{milestone.title}</h3>
                        <p className="text-slate-350 text-sm font-medium flex items-center gap-1.5">
                          <User className="size-4 text-purple" /> {milestone.student}
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">{milestone.scholarship}</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-slate-400">
                        <span className="font-mono">Address: {milestone.studentWallet.slice(0, 8)}...{milestone.studentWallet.slice(-6)}</span>
                        <span className="flex items-center gap-1"><Calendar className="size-3.5" /> Due Date: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                      </div>

                      {milestone.proofUrl && (
                        <div className="pt-2">
                          <a
                            href={milestone.proofUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-cyan hover:text-white transition-colors bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl font-medium"
                          >
                            <FileText className="size-4" /> Click to Inspect Academic Proof <ExternalLink className="size-3.5" />
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex items-end justify-start lg:justify-end">
                      <MilestoneActions
                        scholarshipId={milestone.scholarshipId}
                        milestoneId={numericId}
                        studentWallet={milestone.studentWallet}
                        amount={milestone.amount}
                        proofUri={milestone.proofUrl ?? ""}
                      />
                    </div>
                  </Card>
                );
              })
            )
          ) : releasedMilestones.length === 0 ? (
            <Card className="glass text-center py-16">
              <div className="inline-flex p-3 rounded-full bg-white/5 text-slate-405 mb-4">
                <FileText className="size-8" />
              </div>
              <h3 className="text-xl font-semibold text-white">No historical disbursements</h3>
              <p className="mt-2 text-slate-400 text-sm max-w-sm mx-auto">
                Once escrow releases are verified and released, they will be archived here as immutable ledger events.
              </p>
            </Card>
          ) : (
            releasedMilestones.map((milestone) => {
              return (
                <Card key={`${milestone.scholarshipId}-${milestone.id}`} className="glass p-5 relative overflow-hidden flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                  <div className="absolute top-0 left-0 h-full w-[3px] bg-green-500" />
                  
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-green-950/20 text-green border-green/30 flex items-center gap-1 text-[10px]">
                        <CheckCircle2 className="size-3" /> Released
                      </Badge>
                      <span className="text-xs text-slate-400 font-semibold">{milestone.amount} XLM released</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{milestone.title}</h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Recipient: <strong className="text-white">{milestone.student}</strong> • Campaign: <strong className="text-white">{milestone.scholarship}</strong>
                    </p>
                  </div>

                  {milestone.txHash && (
                    <div className="shrink-0">
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${milestone.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-cyan hover:text-white transition-colors bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl font-mono"
                      >
                        Tx Hash: {milestone.txHash.slice(0, 8)}...{milestone.txHash.slice(-6)} <ExternalLink className="size-3" />
                      </a>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      )}
    </AppShell>
  );
}
