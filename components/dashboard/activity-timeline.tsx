import type { ActivityItem } from "@/lib/types";

export function ActivityTimeline({ items }: { items: ActivityItem[] }) {
	return (
		<div className="space-y-4">
			{items.map((item) => (
				<div key={item.id} className="rounded-2xl border border-white/10 bg-white/[.06] p-4">
					<p className="font-semibold">{item.title}</p>
					<p className="text-sm text-slate-300">{item.description}</p>
					<p className="mt-2 text-xs text-slate-500">{item.timestamp}</p>
				</div>
			))}
		</div>
	);
}
