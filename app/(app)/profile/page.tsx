import { Card } from "@/components/ui";
import { AppShell } from "@/components/shared/app-shell";
import { currentStudent } from "@/lib/mock-data";
export default function ProfilePage() { return <AppShell title="Profile" subtitle="Public metadata is stored in Firestore while funds remain entirely on-chain."><Card><div className="flex items-center gap-4"><div className="grid size-16 place-items-center rounded-3xl bg-gradient-to-br from-aqua to-stellar text-xl font-black">{currentStudent.avatar}</div><div><h2 className="text-2xl font-bold">{currentStudent.name}</h2><p className="text-slate-300">{currentStudent.institution} • {currentStudent.country}</p></div></div><p className="mt-6 text-slate-300">{currentStudent.bio}</p></Card></AppShell>; }
