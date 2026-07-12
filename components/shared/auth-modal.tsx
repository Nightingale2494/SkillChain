"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { Card, Button } from "@/components/ui";

export function AuthModal() {
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
  } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      if (mode === "signin") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, name, password);
      }
      setAuthModalOpen(false);
      // Reset fields
      setName("");
      setEmail("");
      setPassword("");
    } catch (err: any) {
      setErrorMsg(err?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      await signInWithGoogle();
      setAuthModalOpen(false);
    } catch (err: any) {
      setErrorMsg(err?.message || "Google Sign-In failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      <Card className="relative max-w-md w-full border border-white/10 bg-ink/90 shadow-glow p-6 md:p-8">
        
        {/* Close Button */}
        <button
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white text-lg transition"
        >
          &times;
        </button>

        {/* Title */}
        <h2 className="text-3xl font-black text-center text-white">
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </h2>
        <p className="text-center text-xs text-slate-400 mt-2">
          Transparent escrows and milestones on Stellar
        </p>

        {/* Google Authentication Button */}
        <div className="mt-6">
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15 transition disabled:opacity-50"
          >
            {/* Simple Inline Google G SVG Icon */}
            <svg className="size-4 fill-white" viewBox="0 0 24 24">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-6.887 4.114-4.664 0-8.384-3.525-8.384-8.114s3.72-8.114 8.384-8.114c2.25 0 4.3.81 5.92 2.242l3.18-3.19C18.665.98 15.632 0 12.24 0 5.48 0 0 5.373 0 12s5.48 12 12.24 12c7.04 0 11.76-4.8 11.76-11.727 0-.796-.08-1.398-.18-1.988H12.24z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3 text-xs text-slate-500 uppercase tracking-wider">
          <div className="h-px flex-1 bg-white/10" />
          <span>or use email</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <label className="block text-sm text-slate-300">
              Full Name
              <input
                required
                type="text"
                placeholder="John Doe"
                className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/70 px-4 py-3 text-white focus:border-mint/40 outline-none transition text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          )}

          <label className="block text-sm text-slate-300">
            Email Address
            <input
              required
              type="email"
              placeholder="name@example.com"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/70 px-4 py-3 text-white focus:border-mint/40 outline-none transition text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>

          <label className="block text-sm text-slate-300">
            Password
            <input
              required
              type="password"
              placeholder="••••••••"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-ink/70 px-4 py-3 text-white focus:border-mint/40 outline-none transition text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>

          {errorMsg && (
            <p className="text-xs text-red-300 text-center font-medium mt-1">
              {errorMsg}
            </p>
          )}

          <div className="pt-2">
            <Button
              className="w-full justify-center"
              type="submit"
              disabled={loading}
            >
              {loading ? "Processing..." : mode === "signin" ? "Sign In" : "Register"}
            </Button>
          </div>
        </form>

        {/* Footer toggler */}
        <div className="mt-6 text-center text-xs text-slate-400">
          {mode === "signin" ? (
            <p>
              New to SkillChain?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-mint hover:underline font-bold ml-1"
              >
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => setMode("signin")}
                className="text-mint hover:underline font-bold ml-1"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

      </Card>
    </div>
  );
}
