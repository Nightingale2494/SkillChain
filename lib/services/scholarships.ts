import { env } from "@/lib/env";
import type { Scholarship } from "@/lib/types";

import {
  buildScholarshipCreationTransaction,
  buildDonationTransaction,
  buildMilestoneApprovalTransaction,
  buildEscrowReleaseTransaction,
  submitSignedTransaction,
} from "@/lib/services/blockchain";

import {
  createScholarship,
  recordDonation,
  verifyMilestone,
  getScholarship,
  updateScholarship,
  createNotification,
  listDonations,
} from "@/lib/services/firestore";

type WalletSigner = {
  publicKey: string;
  sign(xdr: string): Promise<string>;
};

type ScholarshipCreationInput = Pick<
  Scholarship,
  | "title"
  | "description"
  | "studentWallet"
  | "studentName"
  | "university"
  | "country"
  | "category"
  | "goal"
  | "deadline"
>;

export interface ScholarshipCreationResult {
  firestoreId: string;
  txHash: string;
  explorerUrl: string;
}

function explorer(txHash: string) {
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`;
}

/**
 * CREATE SCHOLARSHIP CAMPAIGN
 */
export async function createScholarshipCampaign(params: {
  input: ScholarshipCreationInput;
  signer: WalletSigner;
  creatorUid?: string;
}): Promise<ScholarshipCreationResult> {
  const creationTx = await buildScholarshipCreationTransaction({
    creator: params.signer.publicKey,
    title: params.input.title,
    description: params.input.description,
    student: params.input.studentWallet,
    studentName: params.input.studentName,
    university: params.input.university,
    country: params.input.country,
    category: params.input.category,
    goal: params.input.goal,
    deadline: params.input.deadline,
    escrowContract: env.escrowContractId || process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID || "",
  });

  const signed = await params.signer.sign(creationTx.xdr);
  const txResult = await submitSignedTransaction(signed);

  const firestoreDoc = await createScholarship({
    chainId: 0,
    ...params.input,
    escrowContract: env.escrowContractId || process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID || "",
    documents: [],
    milestones: [],
    creatorUid: params.creatorUid || "",
  });

  const firestoreId = firestoreDoc.id;
  const defaultMilestones = [
    {
      id: "1",
      scholarshipId: firestoreId,
      title: "Semester 1 Enrollment & Registration",
      amount: Math.round(params.input.goal * 0.3),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      verifier: "NGO Partner",
      status: "locked" as const,
    },
    {
      id: "2",
      scholarshipId: firestoreId,
      title: "Semester 1 Results & Midterm GPA Review",
      amount: Math.round(params.input.goal * 0.3),
      dueDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      verifier: "NGO Partner",
      status: "locked" as const,
    },
    {
      id: "3",
      scholarshipId: firestoreId,
      title: "Semester 2 Tuition Fees & Enrollment",
      amount: Math.round(params.input.goal * 0.4),
      dueDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
      verifier: "NGO Partner",
      status: "locked" as const,
    },
  ];

  await updateScholarship(firestoreId, { milestones: defaultMilestones });

  return {
    firestoreId,
    txHash: txResult.hash,
    explorerUrl: explorer(txResult.hash),
  };
}

/**
 * SUBMIT SCHOLARSHIP DONATION
 */
export async function submitScholarshipDonation(params: {
  scholarshipId: string;
  scholarshipChainId: number;
  amount: number;
  asset: "XLM" | "USDC";
  signer: WalletSigner;
  donorUid?: string;
}) {
  const donationTx = await buildDonationTransaction({
    donor: params.signer.publicKey,
    scholarshipChainId: params.scholarshipChainId,
    amount: params.amount,
  });

  const signedDonation = await params.signer.sign(donationTx.xdr);
  const donationResult = await submitSignedTransaction(signedDonation);

  await recordDonation({
    scholarshipId: params.scholarshipId,
    donorId: params.signer.publicKey,
    donorName: params.signer.publicKey.slice(0, 8),
    amount: params.amount,
    asset: params.asset,
    txHash: donationResult.hash,
    donorUid: params.donorUid || "",
    donorWallet: params.signer.publicKey,
  });

  const scholarship = await getScholarship(params.scholarshipId);
  if (scholarship) {
    await updateScholarship(params.scholarshipId, {
      raised: scholarship.raised + params.amount,
    });

    // Notify student creator that a donation has been received
    if (scholarship.creatorUid) {
      await createNotification(
        scholarship.creatorUid,
        "Donation Received",
        `Your scholarship "${scholarship.title}" received a donation of ${params.amount} ${params.asset}!`,
        "donation",
        params.donorUid || "system"
      );
    }
  }

  return {
    txHash: donationResult.hash,
    explorerUrl: explorer(donationResult.hash),
    status: donationResult.status,
  };
}

/**
 * APPROVE AND RELEASE MILESTONE ESCROW FUNDS
 */
export async function approveMilestoneRelease(params: {
  scholarshipId: string;
  milestoneId: number;
  amount: number;
  proofUri: string;
  studentWallet: string;
  signer: WalletSigner;
  verifierUid?: string;
}) {
  const approvalTx = await buildMilestoneApprovalTransaction({
    verifier: params.signer.publicKey,
    scholarshipId: params.scholarshipId,
    milestoneId: params.milestoneId,
    proofUri: params.proofUri,
  });

  const signedApproval = await params.signer.sign(approvalTx.xdr);
  const approvalResult = await submitSignedTransaction(signedApproval);

  const releaseTx = await buildEscrowReleaseTransaction({
    verifier: params.signer.publicKey,
    student: params.studentWallet,
    scholarshipId: params.scholarshipId,
    milestoneId: params.milestoneId,
    amount: params.amount,
  });

  const signedRelease = await params.signer.sign(releaseTx.xdr);
  const releaseResult = await submitSignedTransaction(signedRelease);

  await verifyMilestone(
    params.scholarshipId,
    String(params.milestoneId),
    "released",
    "Approved and released on Stellar Testnet",
    releaseResult.hash
  );

  const scholarship = await getScholarship(params.scholarshipId);
  if (scholarship) {
    // Notify student that milestone release is complete
    if (scholarship.creatorUid) {
      await createNotification(
        scholarship.creatorUid,
        "Milestone Funds Released",
        `Milestone ${params.milestoneId} of "${scholarship.title}" has been approved. ${params.amount} XLM released to your wallet!`,
        "release",
        params.verifierUid || "system"
      );
    }

    // Notify all unique donors of this scholarship about the milestone release
    const allDonations = await listDonations();
    const scholarshipDonations = allDonations.filter(d => d.scholarshipId === params.scholarshipId);
    const donorUids = Array.from(new Set(scholarshipDonations.map(d => d.donorUid).filter(Boolean))) as string[];

    for (const dUid of donorUids) {
      await createNotification(
        dUid,
        "Milestone Milestone Released",
        `A milestone you sponsored in "${scholarship.title}" has been completed and released!`,
        "release",
        params.verifierUid || "system"
      );
    }
  }

  return {
    approval: {
      hash: approvalResult.hash,
      status: approvalResult.status,
      explorerUrl: explorer(approvalResult.hash),
    },
    release: {
      hash: releaseResult.hash,
      status: releaseResult.status,
      explorerUrl: explorer(releaseResult.hash),
    },
  };
}
