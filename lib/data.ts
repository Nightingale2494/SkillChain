import { BookOpen, CheckCircle2, GraduationCap, HeartHandshake, Landmark, LineChart, LockKeyhole, ShieldCheck, Sparkles, Users, WalletCards } from "lucide-react";

export const navigation = ["Explore", "How it works", "Milestones", "Analytics", "Roadmap"];

export const stats = [
  { label: "Scholarships funded", value: "$1.8M", note: "testnet volume modeled for MVP" },
  { label: "Milestones verified", value: "12,420", note: "attendance, exams, semesters" },
  { label: "Average escrow fee", value: "<0.01 XLM", note: "powered by Stellar" },
  { label: "Countries supported", value: "42", note: "cross-border ready" },
];

export const features = [
  { icon: WalletCards, title: "Wallet-first onboarding", text: "Freighter, xBull, Albedo and WalletConnect flows with role-aware dashboards for students, donors, NGOs and universities." },
  { icon: LockKeyhole, title: "Soroban escrow", text: "Donations stay locked in scholarship contracts until approved milestone proofs trigger a secure release." },
  { icon: ShieldCheck, title: "Verified outcomes", text: "Universities, NGOs, mentors and admins can approve or reject PDF, image and certificate evidence." },
  { icon: LineChart, title: "Impact analytics", text: "Live funding progress, donor portfolios, milestone velocity, page analytics and operational monitoring." },
  { icon: Landmark, title: "Anchor-ready payouts", text: "Designed for future Stellar Anchor integration so students can receive local fiat deposits from on-chain funding." },
  { icon: Sparkles, title: "Startup-quality UX", text: "Glassmorphism cards, motion-ready sections, dark mode, responsive layouts and production content across core pages." },
];

export const scholarships = [
  { student: "Amina Okafor", title: "Computer Science Degree Completion", university: "University of Lagos", country: "Nigeria", goal: 500, raised: 375, status: "Milestone 3 pending", category: "STEM" },
  { student: "Miguel Santos", title: "Renewable Energy Engineering", university: "Tecnológico de Monterrey", country: "Mexico", goal: 720, raised: 510, status: "Semester verified", category: "Engineering" },
  { student: "Leila Rahman", title: "Nursing Clinical Placement", university: "BRAC University", country: "Bangladesh", goal: 420, raised: 420, status: "Fully funded", category: "Healthcare" },
];

export const milestones = [
  { name: "Semester 1 completed", amount: "125 XLM", verifier: "University registrar", status: "Approved" },
  { name: "Semester 2 completed", amount: "125 XLM", verifier: "Faculty mentor", status: "Approved" },
  { name: "Semester 3 exam pass", amount: "125 XLM", verifier: "NGO reviewer", status: "Pending" },
  { name: "Graduation certificate", amount: "125 XLM", verifier: "Admin + university", status: "Locked" },
];

export const contractFlow = [
  { icon: Users, title: "UserRegistry", text: "Stores student, donor, NGO and university profiles with role-based access." },
  { icon: BookOpen, title: "ScholarshipFactory", text: "Creates campaign contracts, metadata pointers and scholarship IDs." },
  { icon: HeartHandshake, title: "DonationManager", text: "Accepts XLM or issued assets, emits donation events and tracks donor history." },
  { icon: CheckCircle2, title: "MilestoneManager", text: "Creates milestone schedules, stores completion status and records verification decisions." },
  { icon: GraduationCap, title: "ScholarshipEscrow", text: "Locks funds and releases milestone amounts only after approved on-chain validation." },
];

export const roadmap = [
  { phase: "MVP", items: ["Wallet login", "Scholarships", "Donations", "Milestones", "Escrow", "Transaction history", "Analytics"] },
  { phase: "Phase 2", items: ["University verification", "NGO dashboard", "Admin dashboard", "Feedback collection"] },
  { phase: "Phase 3", items: ["Anchor integration", "Fiat on/off ramp", "Stablecoin support", "Scholarship NFTs"] },
];
