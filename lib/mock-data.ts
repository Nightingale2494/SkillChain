import type { ActivityItem, Donation, Scholarship, UserProfile } from "@/lib/types";

export const currentStudent: UserProfile = { id: "stu_amina", name: "Amina Okafor", role: "student", wallet: "GC4V...P7QW", avatar: "AO", country: "Nigeria", institution: "University of Lagos", bio: "Computer science student building open-source learning tools for rural schools." };
export const currentDonor: UserProfile = { id: "donor_maya", name: "Maya Chen", role: "donor", wallet: "GCK2...9LMD", avatar: "MC", country: "Singapore", bio: "Fintech operator funding transparent STEM scholarships." };

export const scholarships: Scholarship[] = [
 { id: "sch_amina_cs", title: "Computer Science Degree Completion", description: "Final-year support for tuition, exam registration and project materials, released after registrar-approved milestones.", studentId: currentStudent.id, studentName: currentStudent.name, university: "University of Lagos", country: "Nigeria", category: "STEM", goal: 500, raised: 375, deadline: "2026-11-15", status: "funding", escrowContract: "CDLZ...AMINA", documents: ["Admission letter", "Semester transcript", "Financial need statement"], createdAt: "2026-07-01", milestones: [
  { id: "m1", scholarshipId: "sch_amina_cs", title: "Semester 1 completed", amount: 125, dueDate: "2026-08-30", verifier: "University registrar", status: "released", txHash: "8a91...f0" },
  { id: "m2", scholarshipId: "sch_amina_cs", title: "Semester 2 completed", amount: 125, dueDate: "2026-10-30", verifier: "Faculty mentor", status: "approved", proofUrl: "Transcript.pdf" },
  { id: "m3", scholarshipId: "sch_amina_cs", title: "Semester 3 exam pass", amount: 125, dueDate: "2027-01-15", verifier: "NGO reviewer", status: "pending", proofUrl: "ExamSlip.png" },
  { id: "m4", scholarshipId: "sch_amina_cs", title: "Graduation certificate", amount: 125, dueDate: "2027-06-15", verifier: "Admin + university", status: "locked" },
 ]},
 { id: "sch_miguel_energy", title: "Renewable Energy Engineering", description: "Milestone funding for lab fees and internship placement in solar micro-grid engineering.", studentId: "stu_miguel", studentName: "Miguel Santos", university: "Tecnológico de Monterrey", country: "Mexico", category: "Engineering", goal: 720, raised: 510, deadline: "2026-12-20", status: "funding", escrowContract: "CDLZ...SOLAR", documents: ["Internship offer", "Transcript"], createdAt: "2026-06-20", milestones: [
  { id: "m1", scholarshipId: "sch_miguel_energy", title: "Lab enrollment", amount: 180, dueDate: "2026-09-01", verifier: "Program director", status: "approved" },
  { id: "m2", scholarshipId: "sch_miguel_energy", title: "Internship started", amount: 180, dueDate: "2026-11-01", verifier: "Employer mentor", status: "pending" },
 ]},
 { id: "sch_leila_nursing", title: "Nursing Clinical Placement", description: "Fully funded clinical placement with final disbursement after attendance proof and hospital sign-off.", studentId: "stu_leila", studentName: "Leila Rahman", university: "BRAC University", country: "Bangladesh", category: "Healthcare", goal: 420, raised: 420, deadline: "2026-09-01", status: "funded", escrowContract: "CDLZ...CARE", documents: ["Hospital placement letter"], createdAt: "2026-05-30", milestones: [
  { id: "m1", scholarshipId: "sch_leila_nursing", title: "Attendance verified", amount: 210, dueDate: "2026-08-01", verifier: "Hospital supervisor", status: "approved" },
  { id: "m2", scholarshipId: "sch_leila_nursing", title: "Final certificate", amount: 210, dueDate: "2026-09-15", verifier: "University admin", status: "locked" },
 ]},
];
export const donations: Donation[] = [
 { id: "don_1", scholarshipId: "sch_amina_cs", donorId: currentDonor.id, donorName: currentDonor.name, amount: 125, asset: "XLM", txHash: "b9a2...11", createdAt: "2026-07-08T10:30:00Z" },
 { id: "don_2", scholarshipId: "sch_miguel_energy", donorId: currentDonor.id, donorName: currentDonor.name, amount: 240, asset: "XLM", txHash: "c3e4...77", createdAt: "2026-07-07T16:10:00Z" },
];
export const activity: ActivityItem[] = [
 { id: "a1", kind: "donation", title: "Donation received", description: "Maya Chen donated 125 XLM to Amina's escrow.", timestamp: "12 minutes ago" },
 { id: "a2", kind: "milestone", title: "Milestone approved", description: "Faculty mentor approved Semester 2 transcript.", timestamp: "2 hours ago" },
 { id: "a3", kind: "release", title: "Funds released", description: "125 XLM released from ScholarshipEscrow to student wallet.", timestamp: "Yesterday" },
];
