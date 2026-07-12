"use client";

import { useEffect, useState } from "react";
import { Card, Button, Badge } from "@/components/ui";
import { AppShell } from "@/components/shared/app-shell";
import { useAuth } from "@/components/providers/auth-provider";
import { useWallet } from "@/components/providers/wallet-provider";

const ROLES = [
  { id: "donor", title: "Donor", desc: "Fund scholarships transparently on-chain" },
  { id: "student", title: "Student", desc: "Receive transparent, milestone-released funding" },
  { id: "ngo", title: "NGO / Institution", desc: "Manage academic milestones & track student verifications" },
  { id: "university", title: "University / Registrar", desc: "Verify student status and release on-chain escrows" },
] as const;

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ProfilePage() {
  const { user, profile, isLoading, updateUserProfile, signInWithGoogle } = useAuth();
  const { session } = useWallet();

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState<string>("unassigned");

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Sync state with profile once loaded
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setCountry(profile.country || "");
      setBio(profile.bio || "");
      setRole(profile.role || "unassigned");
    }
  }, [profile]);

  if (isLoading) {
    return (
      <AppShell title="Profile" subtitle="Loading your SkillChain profile...">
        <div className="grid place-items-center py-20">
          <div className="size-10 animate-spin rounded-full border-4 border-white/20 border-t-mint" />
        </div>
      </AppShell>
    );
  }

  if (!user || !profile) {
    return (
      <AppShell
        title="Profile Center"
        subtitle="Sign in to view and manage your decentralized identity."
      >
        <Card className="max-w-md mx-auto text-center py-10">
          <h2 className="text-2xl font-bold">Authentication Required</h2>
          <p className="mt-3 text-slate-300 text-sm">
            To view or update your profile, please authenticate using Google Sign-In.
          </p>
          <div className="mt-8">
            <Button onClick={signInWithGoogle}>Sign in with Google</Button>
          </div>
        </Card>
      </AppShell>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      if (role === "unassigned") {
        throw new Error("Please choose a role before saving.");
      }

      await updateUserProfile({
        name,
        country,
        bio,
        role: role as any,
      });

      setSuccessMsg("Profile updated successfully!");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const isUnassigned = profile.role === "unassigned";

  return (
    <AppShell
      title="Profile Center"
      subtitle="Manage your public metadata, roles, and linked Stellar address."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.8fr]">
        {/* Left Panel: Summary & Wallet details */}
        <div className="space-y-6">
          <Card className="text-center relative overflow-hidden">
            {isUnassigned && (
              <div className="absolute top-0 right-0 left-0 bg-yellow-500/20 text-yellow-200 border-b border-yellow-500/30 px-3 py-1.5 text-xs font-semibold">
                Action Required: Choose Role
              </div>
            )}
            
            <div className="flex flex-col items-center pt-4">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="size-20 rounded-full border-2 border-mint object-cover"
                />
              ) : (
                <div className="grid size-20 place-items-center rounded-full bg-gradient-to-br from-aqua to-stellar text-2xl font-black">
                  {getInitials(name || profile.name)}
                </div>
              )}
              
              <h2 className="mt-4 text-2xl font-bold">{profile.name || "Unnamed User"}</h2>
              <p className="text-sm text-slate-400 font-mono mt-1">{profile.email}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-1 select-all hover:text-slate-300 transition" title="Double click to copy Account UID">
                UID: {profile.id}
              </p>
              
              <div className="mt-4">
                <Badge className={isUnassigned ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-200" : "border-mint/30 bg-mint/10 text-mint"}>
                  {profile.role.toUpperCase()}
                </Badge>
              </div>
            </div>

            <hr className="my-6 border-white/10" />

            <div className="text-left space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">Linked Stellar Wallet</p>
                {profile.wallet ? (
                  <p className="mt-1 text-sm font-mono break-all text-mint bg-white/[0.04] p-3 rounded-xl border border-white/5">
                    {profile.wallet}
                  </p>
                ) : (
                  <div className="mt-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-200">
                    No linked wallet found. Connect your wallet in the Wallet Center to make escrows, donations, and milestones functional.
                  </div>
                )}
              </div>

              {session && session.publicKey !== profile.wallet && (
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-200">
                  Note: Your currently active browser extension wallet is: <strong className="font-mono break-all block mt-1">{session.publicKey}</strong>. It will automatically sync to your profile upon the next save.
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Panel: Form inputs */}
        <div>
          <Card>
            <h3 className="text-xl font-bold mb-6">Edit Profile Details</h3>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block text-sm text-slate-300">
                  Full Name
                  <input
                    required
                    type="text"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/70 px-4 py-3 text-white focus:border-mint/40 outline-none transition"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>

                <label className="block text-sm text-slate-300">
                  Country
                  <input
                    type="text"
                    placeholder="e.g. Nigeria, Mexico"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/70 px-4 py-3 text-white focus:border-mint/40 outline-none transition"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  />
                </label>
              </div>

              <label className="block text-sm text-slate-300">
                Bio / Mission Statement
                <textarea
                  className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-ink/70 px-4 py-3 text-white focus:border-mint/40 outline-none transition"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </label>

              {/* Role Chooser Cards */}
              <div>
                <p className="text-sm text-slate-300 mb-3">Select your platform role:</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {ROLES.map((r) => {
                    const isSelected = role === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setRole(r.id)}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all hover:bg-white/[0.03] ${
                          isSelected
                            ? "border-mint bg-mint/5 shadow-glow"
                            : "border-white/10 bg-ink/40"
                        }`}
                      >
                        <p className="font-bold text-white">{r.title}</p>
                        <p className="text-xs text-slate-400 mt-1">{r.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving Changes..." : "Save Profile Details"}
                </Button>

                {successMsg && (
                  <p className="text-sm text-mint font-semibold text-center mt-2">{successMsg}</p>
                )}
                {errorMsg && (
                  <p className="text-sm text-red-300 font-semibold text-center mt-2">{errorMsg}</p>
                )}
              </div>
            </form>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
