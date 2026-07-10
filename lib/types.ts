export type Role = "student" | "donor" | "university" | "ngo" | "admin";
export type WalletProvider = "freighter" | "xbull" | "albedo";
export type ScholarshipStatus = "draft" | "funding" | "funded" | "in_review" | "completed";
export type MilestoneStatus = "locked" | "pending" | "approved" | "rejected" | "released";

export interface UserProfile { id: string; name: string; role: Role; wallet: string; avatar: string; country: string; institution?: string; bio: string; }
export interface Milestone { id: string; scholarshipId: string; title: string; amount: number; dueDate: string; verifier: string; status: MilestoneStatus; proofUrl?: string; txHash?: string; feedback?: string; }
export interface Donation { id: string; scholarshipId: string; donorId: string; donorName: string; amount: number; asset: "XLM" | "USDC"; txHash: string; createdAt: string; }
export interface Scholarship { id: string; title: string; description: string; studentId: string; studentName: string; university: string; country: string; category: string; goal: number; raised: number; deadline: string; status: ScholarshipStatus; escrowContract: string; documents: string[]; milestones: Milestone[]; createdAt: string; }
export interface ActivityItem { id: string; title: string; description: string; timestamp: string; kind: "donation" | "milestone" | "release" | "wallet"; }
