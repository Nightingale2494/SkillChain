import { AppShell } from "@/components/shared/app-shell";
import { ScholarshipExplorer } from "@/components/scholarships/scholarship-explorer";
import { listScholarships } from "@/lib/services/firestore";

export default async function ScholarshipsPage() {
	const scholarships = await listScholarships();

	return (
		<AppShell
			title="Explore scholarships"
			subtitle="Search by country, university, category, funding status and impact potential."
		>
			<ScholarshipExplorer scholarships={scholarships} />
		</AppShell>
	);
}
