"use client";

import Link from "next/link";
import { Button } from "@/components/ui";
import { useAuth } from "@/components/providers/auth-provider";

const navigation = [
  { label: "Explore", href: "/scholarships" },
  { label: "Student", href: "/dashboard/student" },
  { label: "Donor", href: "/dashboard/donor" },
  { label: "Milestones", href: "/milestones" },
  { label: "Analytics", href: "/analytics" },
  { label: "Wallet", href: "/wallet" },
];

export function LandingNavbar() {
  const { user, profile, isLoading, setAuthModalOpen, signOutUser } = useAuth();

  const getDashboardLink = () => {
    if (!profile) return "/dashboard/student";
    if (profile.role === "unassigned") return "/profile";
    if (profile.role === "donor") return "/dashboard/donor";
    return "/dashboard/student";
  };

  const navItems = [...navigation];
  if (profile?.role === "admin") {
    navItems.push({ label: "Admin", href: "/admin" });
  }

  return (
    <nav className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-stellar to-aqua font-black text-white shadow-md">
          SC
        </div>
        <span className="font-bold text-lg text-white tracking-tight">SkillChain</span>
      </div>

      <div className="hidden gap-6 text-sm text-slate-300 md:flex">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="hover:text-white transition">
            {item.label}
          </Link>
        ))}
      </div>


      <div className="flex items-center gap-4">
        {isLoading ? (
          <div className="size-6 animate-spin rounded-full border-2 border-white/20 border-t-mint" />
        ) : user ? (
          <div className="flex items-center gap-3">
            <Link href="/profile" className="flex items-center gap-2 group">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="size-8 rounded-full border border-mint/40 object-cover"
                />
              ) : (
                <div className="grid size-8 place-items-center rounded-full bg-gradient-to-br from-aqua to-stellar text-xs font-black text-white">
                  {profile?.name ? profile.name.slice(0, 2).toUpperCase() : "U"}
                </div>
              )}
              <span className="hidden sm:inline text-sm font-medium text-slate-200 group-hover:text-white transition">
                {profile?.name || "User"}
              </span>
            </Link>
            <Button variant="secondary" onClick={signOutUser} className="!px-3 !py-1.5 text-xs">
              Sign Out
            </Button>
          </div>
        ) : (
          <Button onClick={() => setAuthModalOpen(true)} className="!px-4 !py-2 text-xs">
            Sign In
          </Button>
        )}


        <Link href={getDashboardLink()}>
          <Button className="text-xs">Launch app</Button>
        </Link>
      </div>
    </nav>
  );
}
