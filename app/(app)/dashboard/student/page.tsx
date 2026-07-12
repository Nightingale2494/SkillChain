"use client";

import { useEffect, useState, useTransition } from "react";
import { ActivityTimeline } from "@/components/dashboard/activity-timeline";
import { FundingChart } from "@/components/dashboard/funding-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { AppShell } from "@/components/shared/app-shell";
import { Card, Button, Badge } from "@/components/ui";
import { listDashboardActivity } from "@/lib/services/dashboard-service";
import { listScholarshipsForStudent, updateScholarship, uploadDocument, createNotification } from "@/lib/services/firestore";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "next/navigation";
import type { Scholarship, ActivityItem, Milestone } from "@/lib/types";
import { CheckCircle2, Clock, FileText, Lock, AlertCircle, Sparkles } from "lucide-react";

export default function StudentDashboard() {
  const { user, profile, isLoading, updateUserProfile, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Milestone Proof Submission form state
  const [submittingMilestoneId, setSubmittingMilestoneId] = useState<string | null>(null);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofTextUrl, setProofTextUrl] = useState<string>("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadData = () => {
    if (profile && profile.role === "student") {
      setLoadingData(true);
      Promise.all([
        listScholarshipsForStudent(profile.id),
        listDashboardActivity(),
      ])
        .then(([sList, actList]) => {
          setScholarships(sList);
          setActivity(actList);
        })
        .catch(err => console.error("Error loading student data:", err))
        .finally(() => setLoadingData(false));
    }
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  if (isLoading) {
    return (
      <AppShell title="Student dashboard" subtitle="Loading your workspace...">
        <div className="grid place-items-center py-20">
          <div className="size-10 animate-spin rounded-full border-4 border-white/20 border-t-purple" />
        </div>
      </AppShell>
    );
  }

  if (!user || !profile) {
    return (
      <AppShell title="Student dashboard" subtitle="Sign in to view your dashboard.">
        <div className="max-w-md mx-auto">
          <Card className="text-center py-10 glass">
            <div className="inline-flex p-3 rounded-full bg-purple/10 text-purple mb-4">
              <Lock className="size-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Authentication Required</h2>
            <p className="mt-3 text-slate-350 text-sm">
              Please log in using your Google or Email/Password account to access the student dashboard.
            </p>
            <div className="mt-6">
              <Button onClick={signInWithGoogle} className="shadow-lg shadow-purple/20">Sign in with Google</Button>
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (profile.role !== "student") {
    return (
      <AppShell
        title="Student dashboard"
        subtitle="Track live scholarship records, milestone reviews and funding progress in one transparent workspace."
      >
        <div className="max-w-md mx-auto">
          <Card className="text-center py-10 glass">
            <div className="inline-flex p-3 rounded-full bg-cyan/10 text-cyan mb-4">
              <Sparkles className="size-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Student Dashboard Access</h2>
            <p className="mt-3 text-slate-350 text-sm">
              This dashboard is configured for Student profiles. Your current profile role is{" "}
              <span className="font-semibold text-purple capitalize">"{profile.role}"</span>.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={() => updateUserProfile({ role: "student" })} className="shadow-lg shadow-purple/20">
                Switch to Student
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

  const raised = scholarships.reduce((sum, scholarship) => sum + scholarship.raised, 0);
  const pendingProofs = scholarships
    .flatMap((scholarship) => scholarship.milestones)
    .filter((milestone) => milestone.status === "pending").length;

  const handleProofSubmit = (scholarshipId: string, milestoneId: string) => {
    if (!proofFile && !proofTextUrl.trim()) {
      setUploadError("Please provide either a PDF document or a text proof URL");
      return;
    }

    setUploadError(null);
    startTransition(async () => {
      try {
        let finalProofUrl = proofTextUrl.trim();

        // If a file is selected, upload it to Firebase Storage
        if (proofFile) {
          const path = `proofs/${scholarshipId}/${milestoneId}/${Date.now()}_${proofFile.name}`;
          finalProofUrl = await uploadDocument(proofFile, path);
        }

        // Retrieve current campaign
        const campaign = scholarships.find(s => s.id === scholarshipId);
        if (!campaign) throw new Error("Campaign not found");

        // Update milestones status to pending
        const updatedMilestones = campaign.milestones.map((m) => {
          if (m.id === milestoneId) {
            return {
              ...m,
              status: "pending" as const,
              proofUrl: finalProofUrl,
            };
          }
          return m;
        });

        // Add proof document to global campaign documents list
        const updatedDocs = [...(campaign.documents || []), finalProofUrl];

        // Save to Firestore
        await updateScholarship(scholarshipId, {
          milestones: updatedMilestones,
          documents: updatedDocs,
        });

        // Create Verifier Notification
        await createNotification(
          "NGO",
          "Verification Proof Submitted",
          `Student "${profile.name}" submitted proof for milestone in "${campaign.title}".`,
          "submission",
          profile.id
        );

        // Reset state & reload
        setSubmittingMilestoneId(null);
        setProofFile(null);
        setProofTextUrl("");
        loadData();
      } catch (err) {
        console.error("Proof upload failed:", err);
        setUploadError(err instanceof Error ? err.message : "Unable to submit proof document");
      }
    });
  };

  return (
    <AppShell
      title="Student dashboard"
      subtitle="Track live scholarship records, milestone reviews and funding progress in one transparent workspace."
    >
      {loadingData ? (
        <div className="grid place-items-center py-20">
          <div className="size-10 animate-spin rounded-full border-4 border-white/20 border-t-purple" />
        </div>
      ) : (
        <>
          {/* STATS STRIP */}
          <div className="grid gap-5 md:grid-cols-4">
            <StatCard
              label="Active scholarships"
              value={String(scholarships.length)}
              detail="Your campaign count"
            />
            <StatCard label="Funds raised" value={`${raised} XLM`} detail="Across your scholarships" />
            <StatCard
              label="Pending proofs"
              value={String(pendingProofs)}
              detail="Milestones awaiting review"
            />
            <StatCard
              label="Your profile"
              value={profile.name}
              detail={profile.wallet ? `${profile.wallet.slice(0, 6)}...${profile.wallet.slice(-4)}` : "Wallet not linked"}
            />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            {/* LEFT COLUMN: ACTIVE CAMPAIGNS AND MILESTONE MANAGER */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white tracking-wide">My Campaigns & Milestones</h2>

              {scholarships.length === 0 ? (
                <Card className="glass text-center py-12">
                  <div className="inline-flex p-3 rounded-full bg-white/5 text-slate-400 mb-4">
                    <FileText className="size-8" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">No campaigns found</h3>
                  <p className="mt-2 text-slate-400 text-sm max-w-sm mx-auto">
                    You haven't launched any scholarship campaigns yet. Create one on Stellar to start receiving donations.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => router.push("/scholarships/create")} className="shadow-lg shadow-purple/20">
                      Launch a Campaign
                    </Button>
                  </div>
                </Card>
              ) : (
                scholarships.map((scholarship) => {
                  const progress = scholarship.goal > 0 ? (scholarship.raised / scholarship.goal) * 100 : 0;
                  return (
                    <Card key={scholarship.id} className="glass p-6 overflow-hidden relative">
                      <div className="absolute top-0 right-0 h-[2px] w-full bg-gradient-to-r from-transparent via-purple/50 to-transparent" />
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div>
                          <Badge className="text-xs text-purple border-purple/30 bg-purple/5 mb-2">
                            {scholarship.category}
                          </Badge>
                          <h3 className="text-xl font-bold text-white">{scholarship.title}</h3>
                          <p className="text-xs text-slate-400 mt-1">{scholarship.university} • {scholarship.country}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block font-medium">Escrow Contract</span>
                          <span className="font-mono text-xs text-cyan tracking-wider">
                            {scholarship.escrowContract ? `${scholarship.escrowContract.slice(0, 8)}...${scholarship.escrowContract.slice(-6)}` : "Not deployed"}
                          </span>
                        </div>
                      </div>

                      {/* FUNDING PROGRESS GAUGE */}
                      <div className="mt-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-slate-350">Funding Progress</span>
                          <span className="text-white font-bold">{scholarship.raised} / {scholarship.goal} XLM ({progress.toFixed(0)}%)</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple via-cyan to-green h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* MILESTONE LIST */}
                      <div className="mt-8">
                        <h4 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 border-b border-white/5 pb-2">Academic Roadmap & Release Stages</h4>
                        <div className="space-y-4">
                          {scholarship.milestones.map((milestone, idx) => {
                            const isSubmitting = submittingMilestoneId === milestone.id;
                            return (
                              <div key={milestone.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                                    <h5 className="font-semibold text-white text-sm">{milestone.title}</h5>
                                  </div>
                                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 mt-1">
                                    <span>Release Amount: <strong className="text-white">{milestone.amount} XLM</strong></span>
                                    <span>Due Date: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                                    <span>Verifier: {milestone.verifier}</span>
                                  </div>
                                  
                                  {milestone.feedback && (
                                    <p className="mt-2 text-xs text-red-300 bg-red-950/20 border border-red-900/30 rounded-xl p-2.5 flex items-start gap-2 max-w-lg">
                                      <AlertCircle className="size-4 shrink-0 mt-0.5" />
                                      <span>{milestone.feedback}</span>
                                    </p>
                                  )}
                                </div>

                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto self-stretch md:self-auto shrink-0 justify-end">
                                  {/* STATUS BADGE */}
                                  <div className="inline-flex items-center gap-1.5 justify-center">
                                    {milestone.status === "locked" && (
                                      <Badge className="bg-slate-800 text-slate-400 border-slate-700/50 flex items-center gap-1">
                                        <Lock className="size-3" /> Locked
                                      </Badge>
                                    )}
                                    {milestone.status === "pending" && (
                                      <Badge className="bg-yellow-950/20 text-yellow-400 border-yellow-900/30 flex items-center gap-1">
                                        <Clock className="size-3 animate-pulse" /> Pending NGO
                                      </Badge>
                                    )}
                                    {milestone.status === "released" && (
                                      <Badge className="bg-green-950/20 text-green-400 border-green-900/30 flex items-center gap-1">
                                        <CheckCircle2 className="size-3" /> Released
                                      </Badge>
                                    )}
                                  </div>

                                  {/* SUBMIT PROOF BUTTON */}
                                  {milestone.status === "locked" && !isSubmitting && (
                                    <Button
                                      onClick={() => setSubmittingMilestoneId(milestone.id)}
                                      className="!px-4 !py-2 text-xs shadow-sm shadow-purple/10"
                                    >
                                      Submit Proof
                                    </Button>
                                  )}
                                </div>

                                {/* FILE UPLOAD/PROOF FORM FIELDS */}
                                {isSubmitting && (
                                  <div className="w-full mt-4 pt-4 border-t border-white/5 space-y-4">
                                    <h6 className="text-xs font-bold text-white uppercase tracking-wider">Provide Verification Proof</h6>
                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div>
                                        <label className="text-xs text-slate-400 block mb-1">Upload PDF Transcript / Document</label>
                                        <input
                                          type="file"
                                          accept="application/pdf"
                                          onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                                          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs text-slate-400 block mb-1">OR Enter Document Link (URL)</label>
                                        <input
                                          type="text"
                                          placeholder="https://myuniversity.edu/records/..."
                                          value={proofTextUrl}
                                          onChange={(e) => setProofTextUrl(e.target.value)}
                                          className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2.5 text-xs text-white"
                                        />
                                      </div>
                                    </div>

                                    {uploadError && (
                                      <p className="text-xs text-red-300 flex items-center gap-1">
                                        <AlertCircle className="size-3.5" /> {uploadError}
                                      </p>
                                    )}

                                    <div className="flex gap-2 justify-end">
                                      <Button
                                        variant="secondary"
                                        disabled={isPending}
                                        onClick={() => {
                                          setSubmittingMilestoneId(null);
                                          setUploadError(null);
                                        }}
                                        className="!px-4 !py-2 text-xs"
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        disabled={isPending}
                                        onClick={() => handleProofSubmit(scholarship.id, milestone.id)}
                                        className="!px-4 !py-2 text-xs shadow-sm shadow-purple/10"
                                      >
                                        {isPending ? "Uploading document..." : "Submit PDF Proof"}
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
            </div>

            {/* RIGHT COLUMN: ANALYTICS & TIMELINE */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white tracking-wide">Scholarship Growth</h2>
              <FundingChart scholarships={scholarships} />
              
              <div className="glass rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 h-[2px] w-full bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
                <h2 className="text-xl font-bold text-white">System Events</h2>
                <div className="mt-5">
                  <ActivityTimeline items={activity} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
