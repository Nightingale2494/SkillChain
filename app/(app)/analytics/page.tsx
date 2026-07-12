import { FundingChart } from "@/components/dashboard/funding-chart";
import { StatCard } from "@/components/dashboard/stat-card";
import { AppShell } from "@/components/shared/app-shell";
import {
  listDonations,
  listScholarships,
} from "@/lib/services/firestore";

export default async function AnalyticsPage() {
  const [scholarships, donations] = await Promise.all([
    listScholarships(),
    listDonations(),
  ]);

  const totalRaised = scholarships.reduce(
    (sum, scholarship) => sum + scholarship.raised,
    0
  );

  const totalGoal = scholarships.reduce(
    (sum, scholarship) => sum + scholarship.goal,
    0
  );

  const completed = scholarships.filter(
    (scholarship) => scholarship.status === "completed"
  ).length;

  const releasedMilestones = scholarships
    .flatMap((scholarship) => scholarship.milestones)
    .filter((milestone) => milestone.status === "released").length;

  return (
    <AppShell
      title="Platform Analytics"
      subtitle="Live analytics generated from Firestore scholarship and donation records."
    >
      <div className="grid gap-5 md:grid-cols-4">
        <StatCard
          label="Scholarships"
          value={String(scholarships.length)}
          detail="Active campaigns"
        />

        <StatCard
          label="Donations"
          value={String(donations.length)}
          detail="Donation records"
        />

        <StatCard
          label="Funds Raised"
          value={`${totalRaised} XLM`}
          detail={`Goal: ${totalGoal} XLM`}
        />

        <StatCard
          label="Released Milestones"
          value={String(releasedMilestones)}
          detail={`${completed} scholarships completed`}
        />
      </div>

      <div className="mt-8">
        <FundingChart scholarships={scholarships} />
      </div>
    </AppShell>
  );
}