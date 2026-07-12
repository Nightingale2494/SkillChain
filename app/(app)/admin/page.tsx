"use client";

import { useEffect, useState, useTransition } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { AppShell } from "@/components/shared/app-shell";
import { Card, Button, Badge } from "@/components/ui";
import { useAuth } from "@/components/providers/auth-provider";
import { listScholarships, listUsers, updateUserRole, createNotification } from "@/lib/services/firestore";
import type { Scholarship, UserProfile } from "@/lib/types";
import { ShieldAlert, Users, FolderKanban, Coins, Calendar, CheckSquare, Award, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const { user, profile, isLoading, signInWithGoogle } = useAuth();
  const router = useRouter();

  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadData = () => {
    setLoadingData(true);
    Promise.all([listScholarships(), listUsers()])
      .then(([sList, uList]) => {
        setScholarships(sList);
        setUsers(uList);
      })
      .catch((err) => console.error("Admin load error:", err))
      .finally(() => setLoadingData(false));
  };

  useEffect(() => {
    if (profile && profile.role === "admin") {
      loadData();
    }
  }, [profile]);

  if (isLoading) {
    return (
      <AppShell title="Admin panel" subtitle="Loading administrative dashboard...">
        <div className="grid place-items-center py-20">
          <div className="size-10 animate-spin rounded-full border-4 border-white/20 border-t-purple" />
        </div>
      </AppShell>
    );
  }

  if (!user || !profile) {
    return (
      <AppShell title="Admin panel" subtitle="Sign in to view operations dashboard.">
        <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
          <Card className="text-center py-10 glass">
            <div className="inline-flex p-3 rounded-full bg-purple/10 text-purple mb-4">
              <ShieldAlert className="size-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Authentication Required</h2>
            <p className="mt-3 text-slate-350 text-sm">
              Please log in using your Google or Email/Password account to access the administrative dashboard.
            </p>
            <div className="mt-6">
              <Button onClick={signInWithGoogle} className="shadow-lg shadow-purple/20">Sign in with Google</Button>
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  if (profile.role !== "admin") {
    return (
      <AppShell
        title="Admin panel"
        subtitle="Operational controls for verifier roles, campaign risk checks, feedback review and contract deployment metadata."
      >
        <div className="max-w-md mx-auto">
          <Card className="text-center py-10 glass">
            <div className="inline-flex p-3 rounded-full bg-red-950/20 text-red-400 mb-4 border border-red-900/30">
              <ShieldAlert className="size-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Access Denied</h2>
            <p className="mt-3 text-slate-350 text-sm">
              The Admin dashboard is restricted to administrator accounts. If you require admin access, please contact the database owner.
            </p>
          </Card>
        </div>
      </AppShell>
    );
  }

  const pendingReviews = scholarships
    .flatMap((s) => s.milestones)
    .filter((m) => m.status === "pending").length;

  const verifiersCount = users.filter((u) =>
    ["ngo", "university", "admin"].includes(u.role)
  ).length;

  const contractsCount = scholarships.filter((s) => s.escrowContract).length;

  // Handle role modification
  const handleRoleChange = (userId: string, newRole: UserProfile["role"]) => {
    startTransition(async () => {
      try {
        await updateUserRole(userId, newRole);
        
        // Notify the target user of their role reassignment
        await createNotification(
          userId,
          "Profile Role Updated",
          `An administrator has updated your profile role to "${newRole}".`,
          "system",
          profile.id
        );
        
        loadData();
      } catch (err) {
        console.error("Role update failed:", err);
      }
    });
  };

  return (
    <AppShell
      title="Admin panel"
      subtitle="Operational controls for verifier roles, campaign risk checks, feedback review and contract deployment metadata."
    >
      {loadingData ? (
        <div className="grid place-items-center py-20">
          <div className="size-10 animate-spin rounded-full border-4 border-white/20 border-t-purple" />
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* STATS STRIP */}
          <div className="grid gap-5 md:grid-cols-4">
            <StatCard
              label="Pending reviews"
              value={String(pendingReviews)}
              detail="Proofs awaiting NGO action"
            />
            <StatCard
              label="Flagged campaigns"
              value="0"
              detail="Manual risk check required"
            />
            <StatCard
              label="Active verifiers"
              value={String(verifiersCount)}
              detail={`Across ${users.length} profiles`}
            />
            <StatCard
              label="Contracts deployed"
              value={String(contractsCount)}
              detail="Active Stellar escrows"
            />
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
            {/* USER PROFILE DIRECTORY */}
            <Card className="glass relative overflow-hidden p-6 flex flex-col">
              <div className="absolute top-0 right-0 h-[2px] w-full bg-gradient-to-r from-transparent via-purple/40 to-transparent" />
              
              <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                <Users className="size-5 text-purple" />
                <h3 className="text-lg font-bold text-white">Registered Users & Role Management</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-2.5">User</th>
                      <th className="py-2.5">Wallet address</th>
                      <th className="py-2.5">Role</th>
                      <th className="py-2.5 text-right">Edit Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3">
                          <span className="font-semibold text-white block">{u.name}</span>
                          <span className="text-[10px] text-slate-400 block font-mono truncate max-w-[140px]">{u.email || "No email"}</span>
                        </td>
                        <td className="py-3 font-mono text-slate-400">
                          {u.wallet ? `${u.wallet.slice(0, 6)}...${u.wallet.slice(-4)}` : "Not linked"}
                        </td>
                        <td className="py-3">
                          <Badge className={`text-[10px] font-bold uppercase ${
                            u.role === "admin" 
                              ? "bg-red-950/20 text-red-400 border-red-900/30" 
                              : u.role === "student" 
                                ? "bg-purple/10 text-purple border-purple/30" 
                                : u.role === "donor" 
                                  ? "bg-green-950/20 text-green border-green/30"
                                  : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}>
                            {u.role}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          <select
                            disabled={isPending || u.id === profile.id}
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                            className="bg-black/60 border border-white/10 rounded-xl px-2 py-1.5 text-[11px] text-white outline-none focus:border-purple/40"
                          >
                            <option value="unassigned">Unassigned</option>
                            <option value="student">Student</option>
                            <option value="donor">Donor</option>
                            <option value="ngo">NGO Verifier</option>
                            <option value="university">University</option>
                            <option value="admin">Administrator</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* CAMPAIGN REGISTRY */}
            <Card className="glass relative overflow-hidden p-6">
              <div className="absolute top-0 right-0 h-[2px] w-full bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />
              
              <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
                <FolderKanban className="size-5 text-purple" />
                <h3 className="text-lg font-bold text-white">Active Scholarship Campaigns</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="py-2.5">Title</th>
                      <th className="py-2.5">Escrow</th>
                      <th className="py-2.5 text-right">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {scholarships.map((s) => {
                      const progress = s.goal > 0 ? (s.raised / s.goal) * 100 : 0;
                      return (
                        <tr key={s.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3">
                            <span className="font-semibold text-white block truncate max-w-[150px]">{s.title}</span>
                            <span className="text-[10px] text-slate-400 block">{s.studentName}</span>
                          </td>
                          <td className="py-3 font-mono text-slate-400">
                            {s.escrowContract ? (
                              <a
                                href={`https://stellar.expert/explorer/testnet/contract/${s.escrowContract}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan hover:underline inline-flex items-center gap-1"
                              >
                                {s.escrowContract.slice(0, 6)}... <ArrowUpRight className="size-3" />
                              </a>
                            ) : (
                              "Not deployed"
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <span className="font-semibold text-white block">{s.raised} / {s.goal} XLM</span>
                            <span className="text-[10px] text-slate-400 block">{progress.toFixed(0)}% Funded</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

        </div>
      )}
    </AppShell>
  );
}
