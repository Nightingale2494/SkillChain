import { listDonations, listScholarships } from "@/lib/services/firestore";
import type { ActivityItem } from "@/lib/types";

export async function listDashboardActivity(): Promise<ActivityItem[]> {
  const [scholarships, donations] = await Promise.all([
    listScholarships(),
    listDonations(),
  ]);

  const donationActivity: ActivityItem[] = donations.map((donation) => ({
    id: donation.id,
    kind: "donation",
    title: `${donation.donorName} donated ${donation.amount} ${donation.asset}`,
    description: `Scholarship ${donation.scholarshipId}`,
    timestamp: donation.createdAt,
  }));

  const milestoneActivity: ActivityItem[] = scholarships.flatMap((scholarship) =>
    scholarship.milestones.map((milestone) => ({
      id: `${scholarship.id}-${milestone.id}`,
      kind:
        milestone.status === "released"
          ? "release"
          : "milestone",
      title: milestone.title,
      description: `${scholarship.studentName} • ${milestone.amount} XLM`,
      timestamp: milestone.dueDate,
    }))
  );

  return [...donationActivity, ...milestoneActivity]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() -
        new Date(a.timestamp).getTime()
    )
    .slice(0, 10);
}