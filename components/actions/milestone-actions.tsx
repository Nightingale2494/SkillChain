"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";
import { useWallet } from "@/components/providers/wallet-provider";
import { useAuth } from "@/components/providers/auth-provider";
import { approveMilestoneRelease } from "@/lib/services/scholarships";
import { getScholarship, updateScholarship, createNotification, verifyMilestone } from "@/lib/services/firestore";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export function MilestoneActions({
	scholarshipId,
	milestoneId,
	studentWallet,
	amount,
	proofUri,
}: {
	scholarshipId: string;
	milestoneId: number;
	studentWallet: string;
	amount: number;
	proofUri: string;
}) {
	const { session, sign } = useWallet();
	const { user } = useAuth();
	const router = useRouter();
	
	const [error, setError] = useState<string>();
	const [isPending, startTransition] = useTransition();

	// Reject form state
	const [showRejectForm, setShowRejectForm] = useState(false);
	const [rejectFeedback, setRejectFeedback] = useState("");

	const approve = () =>
		startTransition(() => {
			void (async () => {
				try {
					if (!session) {
						throw new Error("Connect a verifier wallet first");
					}

					await approveMilestoneRelease({
						scholarshipId,
						milestoneId,
						amount,
						proofUri,
						studentWallet,
						signer: {
							publicKey: session.publicKey,
							sign,
						},
						verifierUid: user?.uid,
					});

					setError(undefined);
					router.refresh();
				} catch (e) {
					setError(
						e instanceof Error ? e.message : "Milestone approval failed"
					);
				}
			})();
		});

	const reject = () =>
		startTransition(() => {
			void (async () => {
				try {
					if (!rejectFeedback.trim()) {
						throw new Error("Please specify a rejection reason");
					}

					const scholarship = await getScholarship(scholarshipId);
					if (!scholarship) throw new Error("Campaign not found");

					// Update milestone list
					const updatedMilestones = scholarship.milestones.map((m) => {
						if (Number(m.id) === milestoneId) {
							return {
								...m,
								status: "locked" as const, // Returns to locked status so student can upload again
								feedback: rejectFeedback,
							};
						}
						return m;
					});

					// Save back to Firestore
					await updateScholarship(scholarshipId, {
						milestones: updatedMilestones,
					});

					// Record milestones review log
					await verifyMilestone(
						scholarshipId,
						String(milestoneId),
						"locked",
						`Rejected: ${rejectFeedback}`
					);

					// Send rejection notification to student
					if (scholarship.creatorUid) {
						await createNotification(
							scholarship.creatorUid,
							"Milestone Proof Rejected",
							`Proof for milestone "${scholarship.milestones.find(m => Number(m.id) === milestoneId)?.title}" was rejected: ${rejectFeedback}`,
							"rejection",
							user?.uid || "system"
						);
					}

					setError(undefined);
					setShowRejectForm(false);
					setRejectFeedback("");
					router.refresh();
				} catch (e) {
					setError(
						e instanceof Error ? e.message : "Milestone rejection failed"
					);
				}
			})();
		});

	return (
		<div className="space-y-4">
			<div className="flex gap-3">
				<Button
					disabled={isPending}
					onClick={approve}
					className="shadow-sm shadow-purple/10 !px-4 !py-2 text-xs flex items-center gap-1.5"
				>
					<CheckCircle2 className="size-4" /> Approve & release
				</Button>

				{!showRejectForm && (
					<Button
						variant="secondary"
						disabled={isPending}
						onClick={() => setShowRejectForm(true)}
						className="!px-4 !py-2 text-xs text-red-300 hover:bg-red-950/20 border-red-900/30 flex items-center gap-1.5"
					>
						<XCircle className="size-4" /> Reject Proof
					</Button>
				)}
			</div>

			{showRejectForm && (
				<div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3 max-w-sm animate-in fade-in duration-200">
					<span className="text-xs text-slate-350 block font-medium">Rejection Reason / Feedback</span>
					<textarea
						value={rejectFeedback}
						onChange={(e) => setRejectFeedback(e.target.value)}
						placeholder="E.g., Transcript missing seal or enrollment date is incorrect..."
						className="w-full min-h-20 text-xs rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white"
					/>
					<div className="flex gap-2 justify-end">
						<Button
							variant="secondary"
							onClick={() => {
								setShowRejectForm(false);
								setError(undefined);
							}}
							className="!px-3 !py-1.5 text-[11px]"
						>
							Cancel
						</Button>
						<Button
							onClick={reject}
							className="bg-red-650 hover:bg-red-750 text-white !px-3 !py-1.5 text-[11px] shadow-sm shadow-red-900/10"
						>
							Submit Rejection
						</Button>
					</div>
				</div>
			)}

			{error ? (
				<p className="mt-2 text-xs text-red-300 flex items-center gap-1">
					<AlertCircle className="size-3.5" /> {error}
				</p>
			) : null}
		</div>
	);
}
