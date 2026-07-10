import { Card } from "@/components/ui";
export function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) { return <Card><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-3xl font-black">{value}</p><p className="mt-2 text-sm text-slate-300">{detail}</p></Card>; }
