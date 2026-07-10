import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { scholarships as fallbackScholarships } from "@/lib/mock-data";
import type { Donation, Milestone, Scholarship } from "@/lib/types";

export function listenToScholarships(callback: (items: Scholarship[]) => void) { try { return onSnapshot(query(collection(db, "scholarships"), orderBy("createdAt", "desc")), (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Scholarship))); } catch { callback(fallbackScholarships); return () => undefined; } }
export function listenToStudentScholarships(studentId: string, callback: (items: Scholarship[]) => void) { try { return onSnapshot(query(collection(db, "scholarships"), where("studentId", "==", studentId)), (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Scholarship))); } catch { callback(fallbackScholarships.filter((s) => s.studentId === studentId)); return () => undefined; } }
export async function createScholarship(input: Omit<Scholarship, "id" | "createdAt" | "raised" | "status">) { return addDoc(collection(db, "scholarships"), { ...input, raised: 0, status: "funding", createdAt: serverTimestamp() }); }
export async function updateScholarship(id: string, patch: Partial<Scholarship>) { await updateDoc(doc(db, "scholarships", id), patch); }
export async function recordDonation(donation: Omit<Donation, "id" | "createdAt">) { return addDoc(collection(db, "donations"), { ...donation, createdAt: serverTimestamp() }); }
export async function verifyMilestone(scholarshipId: string, milestoneId: string, status: Milestone["status"], feedback: string) { await addDoc(collection(db, "milestoneReviews"), { scholarshipId, milestoneId, status, feedback, createdAt: serverTimestamp() }); }
