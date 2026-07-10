"use client";
import { Card } from "@/components/ui";
import { AppShell } from "@/components/shared/app-shell";
import { useWallet } from "@/components/providers/wallet-provider";
export default function ProfilePage() { const { session } = useWallet(); return <AppShell title="Profile" subtitle="Public profile metadata is stored in Firestore while funds remain entirely on-chain."><Card><div className="flex items-center gap-4"><div className="grid size-16 place-items-center rounded-3xl bg-gradient-to-br from-aqua to-stellar text-xl font-black">SC</div><div><h2 className="text-2xl font-bold">{session ? "Connected SkillChain user" : "Connect wallet to load profile"}</h2><p className="text-slate-300">{session?.publicKey ?? "No wallet session"}</p></div></div><p className="mt-6 text-slate-300">Role, institution, country and verification permissions are loaded from the Firestore user registry after wallet authentication.</p></Card></AppShell>; }
