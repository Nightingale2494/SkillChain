"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui";
import { useAuth } from "@/components/providers/auth-provider";
import { subscribeToNotifications, markNotificationAsRead } from "@/lib/services/firestore";
import {
  LayoutDashboard,
  GraduationCap,
  Compass,
  CheckSquare,
  BarChart3,
  Wallet,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  User as UserIcon,
  Bell,
  CheckCircle,
} from "lucide-react";

const links = [
  { href: "/dashboard/student", label: "Student Space", icon: LayoutDashboard },
  { href: "/dashboard/donor", label: "Donor Space", icon: GraduationCap },
  { href: "/scholarships", label: "Explore Campaigns", icon: Compass },
  { href: "/milestones", label: "Milestone Reviews", icon: CheckSquare },
  { href: "/analytics", label: "Analytics Feed", icon: BarChart3 },
  { href: "/wallet", label: "Wallet Center", icon: Wallet },
];

export function AppShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  const { user, profile, isLoading, signOutUser, setAuthModalOpen } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Notification Panel State
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      return subscribeToNotifications(user.uid, (list) => {
        setNotifications(list);
      });
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = async () => {
    try {
      const unreadList = notifications.filter((n) => !n.read);
      await Promise.all(unreadList.map((n) => markNotificationAsRead(n.id)));
    } catch (err) {
      console.error("Failed to clear notifications:", err);
    }
  };

  const navLinks = [...links];
  if (profile?.role === "admin") {
    navLinks.push({ href: "/admin", label: "Admin Panel", icon: ShieldAlert });
  }

  const SidebarContent = () => (
    <div className="flex h-full flex-col justify-between p-6">
      <div className="space-y-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-stellar to-aqua font-black text-white shadow-md">
            SC
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">SkillChain</span>
        </Link>

        {/* Nav Links */}
        <nav className="space-y-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-stellar/10 border-l-4 border-stellar text-white shadow-sm"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className={`size-5 ${isActive ? "text-stellar" : "text-slate-400"}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile Footer */}
      <div className="border-t border-white/5 pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="size-6 animate-spin rounded-full border-2 border-white/20 border-t-mint" />
          </div>
        ) : user ? (
          <div className="space-y-4">
            <Link
              href="/profile"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 rounded-xl p-2 hover:bg-white/5 transition"
            >
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="size-9 rounded-full border border-mint/30 object-cover"
                />
              ) : (
                <div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-stellar to-aqua text-xs font-black text-white">
                  {profile?.name ? profile.name.slice(0, 2).toUpperCase() : "U"}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {profile?.name || "User"}
                </p>
                <p className="truncate text-xs text-slate-400 font-mono capitalize">
                  Role: {profile?.role || "unassigned"}
                </p>
              </div>
            </Link>

            <button
              onClick={signOutUser}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </div>
        ) : (
          <Button onClick={() => setAuthModalOpen(true)} className="w-full justify-center">
            Sign In
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative flex bg-ink text-white">
      {/* Background Orbs Grid */}
      <div className="absolute inset-0 bg-grid bg-[length:64px_64px] opacity-[0.06] pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-[40vw] h-[40vh] bg-stellar/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-[45vw] h-[45vh] bg-aqua/8 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* Desktop Sidebar (Left) */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-white/5 bg-[#090d16]/90 backdrop-blur-xl z-20 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        
        {/* Mobile Header (Top) */}
        <header className="flex lg:hidden items-center justify-between border-b border-white/5 bg-[#090d16]/80 p-4 backdrop-blur-md sticky top-0 z-20">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="grid size-8 place-items-center rounded-xl bg-gradient-to-br from-stellar to-aqua font-black text-xs text-white">
              SC
            </div>
            <span className="font-extrabold text-md text-white tracking-tight">SkillChain</span>
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 hover:text-white"
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </header>

        {/* Mobile Side Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer */}
            <aside className="relative flex w-64 max-w-xs flex-col bg-[#090d16] border-r border-white/5 z-50 animate-fadeIn h-full">
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* Main Content Pane */}
        <main className="flex-1 px-4 py-8 md:px-8 max-w-7xl w-full mx-auto space-y-6 relative">
          
          {/* Header Metadata block */}
          <div className="flex justify-between items-start pb-2 border-b border-white/5 gap-4 relative">
            <div className="space-y-1.5">
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                {title}
              </h1>
              <p className="text-sm text-slate-400 max-w-3xl leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Notification Bell */}
            {user && (
              <div className="relative shrink-0 mt-1">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2.5 rounded-2xl border border-white/10 bg-white/5 text-slate-350 hover:text-white hover:bg-white/10 transition-all duration-200 relative"
                >
                  <Bell className="size-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 text-[9px] font-extrabold bg-purple text-white rounded-full size-4 flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown Panel */}
                {showNotifications && (
                  <div className="absolute right-0 top-12 z-30 w-80 max-w-[90vw] rounded-3xl bg-[#090d16]/95 border border-white/10 p-4 shadow-xl backdrop-blur-xl animate-in slide-in-from-top-3 duration-200">
                    <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">Alerts Desk</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[10px] text-cyan hover:underline flex items-center gap-1 font-semibold"
                        >
                          <CheckCircle className="size-3" /> Dismiss all
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-450 py-8 text-center">No alerts registered yet.</p>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={async () => {
                              if (!n.read) await markNotificationAsRead(n.id);
                            }}
                            className={`p-3 rounded-2xl border text-xs cursor-pointer transition ${
                              n.read 
                                ? "bg-transparent border-white/5 text-slate-400" 
                                : "bg-purple/5 border-purple/20 text-white font-medium hover:bg-purple/10"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-bold text-slate-200">{n.title}</span>
                              {!n.read && <span className="size-2 rounded-full bg-purple mt-1 shrink-0" />}
                            </div>
                            <p className="leading-relaxed text-slate-350">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Children Components layout container */}
          <div className="pt-2">
            {children}
          </div>

        </main>
      </div>
    </div>
  );
}
