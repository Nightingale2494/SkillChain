import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import { db, storage } from "@/lib/firebase/client";
import type { Donation, Milestone, Scholarship, UserProfile } from "@/lib/types";

type SnapshotListener<T> = (items: T[]) => void;

function toIsoString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }
  return new Date().toISOString();
}

function normalizeMilestone(milestone: Milestone): Milestone {
  return {
    ...milestone,
    dueDate: toIsoString(milestone.dueDate),
  };
}

function normalizeScholarship(record: Partial<Scholarship>): Scholarship {
  return {
    id: record.id ?? crypto.randomUUID(),
    chainId: Number(record.chainId ?? 0),
    title: record.title ?? "",
    description: record.description ?? "",
    studentWallet: record.studentWallet ?? "",
    studentName: record.studentName ?? "",
    university: record.university ?? "",
    country: record.country ?? "",
    category: record.category ?? "",
    goal: Number(record.goal ?? 0),
    raised: Number(record.raised ?? 0),
    deadline: toIsoString(record.deadline),
    status: record.status ?? "funding",
    escrowContract: record.escrowContract ?? "",
    documents: record.documents ?? [],
    milestones: (record.milestones ?? []).map(normalizeMilestone),
    createdAt: toIsoString(record.createdAt),
    creatorUid: record.creatorUid ?? "",
  };
}

function normalizeDonation(record: Partial<Donation>): Donation {
  return {
    id: record.id ?? crypto.randomUUID(),
    scholarshipId: record.scholarshipId ?? "",
    donorId: record.donorId ?? "",
    donorName: record.donorName ?? "",
    amount: Number(record.amount ?? 0),
    asset: record.asset ?? "XLM",
    txHash: record.txHash ?? "",
    createdAt: toIsoString(record.createdAt),
    donorUid: record.donorUid ?? "",
    donorWallet: record.donorWallet ?? "",
  };
}

function sortByCreatedAtDesc<T extends { createdAt: string }>(items: T[]) {
  return [...items].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

function hydrateScholarship(snapshotDoc: { id: string; data: () => unknown }) {
  return normalizeScholarship({
    id: snapshotDoc.id,
    ...(snapshotDoc.data() as Omit<Scholarship, "id">),
  });
}

function hydrateDonation(snapshotDoc: { id: string; data: () => unknown }) {
  return normalizeDonation({
    id: snapshotDoc.id,
    ...(snapshotDoc.data() as Omit<Donation, "id">),
  });
}

/* -------------------------------------------------------------------------- */
/* SCHOLARSHIPS                                                               */
/* -------------------------------------------------------------------------- */

export async function listScholarships(): Promise<Scholarship[]> {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, "scholarships"));
  return sortByCreatedAtDesc(
    snapshot.docs.map((snapshotDoc) => hydrateScholarship(snapshotDoc))
  );
}

export async function getScholarship(id: string): Promise<Scholarship | null> {
  if (!db) return null;
  const docSnap = await getDoc(doc(db, "scholarships", id));
  if (!docSnap.exists()) return null;
  return hydrateScholarship(docSnap);
}

export async function listScholarshipsForStudent(uid: string): Promise<Scholarship[]> {
  if (!db || !uid) return [];
  const snapshot = await getDocs(
    query(collection(db, "scholarships"), where("creatorUid", "==", uid))
  );
  return sortByCreatedAtDesc(
    snapshot.docs.map((snapshotDoc) => hydrateScholarship(snapshotDoc))
  );
}

export async function createScholarship(
  input: Omit<Scholarship, "id" | "createdAt" | "raised" | "status">
): Promise<{ id: string }> {
  if (!db) return { id: `mock_${crypto.randomUUID()}` };
  return addDoc(collection(db, "scholarships"), {
    ...input,
    raised: 0,
    status: "funding",
    createdAt: serverTimestamp(),
  });
}

export async function updateScholarship(id: string, patch: Partial<Scholarship>): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, "scholarships", id), patch);
}

export function subscribeToScholarships(
  callback: SnapshotListener<Scholarship>,
  onError?: (error: Error) => void
) {
  if (!db) {
    callback([]);
    return () => {};
  }
  return onSnapshot(
    query(collection(db, "scholarships")),
    (snapshot) => {
      callback(
        sortByCreatedAtDesc(
          snapshot.docs.map((snapshotDoc) => hydrateScholarship(snapshotDoc))
        )
      );
    },
    (error) => onError?.(error)
  );
}

/* -------------------------------------------------------------------------- */
/* DONATIONS                                                                  */
/* -------------------------------------------------------------------------- */

export async function listDonations(): Promise<Donation[]> {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, "donations"));
  return sortByCreatedAtDesc(
    snapshot.docs.map((snapshotDoc) => hydrateDonation(snapshotDoc))
  );
}

export async function listDonationsForDonor(uid: string): Promise<Donation[]> {
  if (!db || !uid) return [];
  const snapshot = await getDocs(
    query(collection(db, "donations"), where("donorUid", "==", uid))
  );
  return sortByCreatedAtDesc(
    snapshot.docs.map((snapshotDoc) => hydrateDonation(snapshotDoc))
  );
}

export async function recordDonation(donation: Omit<Donation, "id" | "createdAt">): Promise<{ id: string }> {
  if (!db) return { id: `mock_${crypto.randomUUID()}` };
  return addDoc(collection(db, "donations"), {
    ...donation,
    createdAt: serverTimestamp(),
  });
}

/* -------------------------------------------------------------------------- */
/* MILESTONES & REVIEWS                                                       */
/* -------------------------------------------------------------------------- */

export async function recordMilestoneReview(
  scholarshipId: string,
  milestoneId: string,
  status: Milestone["status"],
  feedback: string,
  txHash?: string
): Promise<{ id: string }> {
  if (!db) return { id: `mock_${crypto.randomUUID()}` };
  return addDoc(collection(db, "milestoneReviews"), {
    scholarshipId,
    milestoneId,
    status,
    feedback,
    txHash,
    createdAt: serverTimestamp(),
  });
}

export const verifyMilestone = recordMilestoneReview;

export async function listMilestoneReviews(scholarshipId: string): Promise<any[]> {
  if (!db) return [];
  const snapshot = await getDocs(
    query(collection(db, "milestoneReviews"), where("scholarshipId", "==", scholarshipId))
  );
  return snapshot.docs
    .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
    .sort((a: any, b: any) => {
      const timeA = a.createdAt?.toDate?.()?.getTime() || 0;
      const timeB = b.createdAt?.toDate?.()?.getTime() || 0;
      return timeB - timeA;
    });
}

/* -------------------------------------------------------------------------- */
/* USERS & WALLETS                                                            */
/* -------------------------------------------------------------------------- */

export async function listUsers(): Promise<UserProfile[]> {
  if (!db) return [];
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as UserProfile));
}

export async function updateUserRole(uid: string, role: UserProfile["role"]): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, "users", uid), { role });
}

export async function saveWalletInfo(
  walletAddress: string,
  ownerUid: string,
  ownerName: string,
  ownerRole: string,
  walletProvider: string
): Promise<void> {
  if (!db) return;
  await setDoc(
    doc(db, "wallets", walletAddress),
    {
      walletAddress,
      ownerUid,
      ownerName,
      ownerRole,
      walletProvider,
      linkedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

/* -------------------------------------------------------------------------- */
/* STORAGE FILE UPLOADS                                                       */
/* -------------------------------------------------------------------------- */

export async function uploadDocument(file: File, path: string): Promise<string> {
  if (!storage) {
    throw new Error("Firebase Storage is not initialized");
  }
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

/* -------------------------------------------------------------------------- */
/* NOTIFICATIONS                                                              */
/* -------------------------------------------------------------------------- */

export async function createNotification(
  recipientUid: string,
  title: string,
  message: string,
  type: string,
  senderUid: string = "system"
): Promise<void> {
  if (!db) return;
  await addDoc(collection(db, "notifications"), {
    recipientUid,
    title,
    message,
    type,
    senderUid,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToNotifications(
  recipientUid: string,
  callback: (notifications: any[]) => void
) {
  if (!db || !recipientUid) {
    callback([]);
    return () => {};
  }
  return onSnapshot(
    query(collection(db, "notifications"), where("recipientUid", "==", recipientUid)),
    (snapshot) => {
      const list = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a: any, b: any) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        });
      callback(list);
    }
  );
}

export async function markNotificationAsRead(id: string): Promise<void> {
  if (!db) return;
  await updateDoc(doc(db, "notifications", id), { read: true });
}

/* -------------------------------------------------------------------------- */
/* EXPLORER SEARCH & FILTERING                                                */
/* -------------------------------------------------------------------------- */

export function searchScholarships(
  items: Scholarship[],
  filters: {
    query?: string;
    category?: string;
    country?: string;
    status?: string;
    major?: string;
    minProgress?: number;
  } = {}
) {
  const queryText = filters.query?.trim().toLowerCase() ?? "";

  return items.filter((scholarship) => {
    const matchesQuery =
      !queryText ||
      [
        scholarship.title,
        scholarship.description,
        scholarship.studentName,
        scholarship.university,
      ]
        .join(" ")
        .toLowerCase()
        .includes(queryText);
    
    const matchesCategory =
      !filters.category || filters.category === "all" || scholarship.category === filters.category;
    
    const matchesCountry =
      !filters.country || filters.country === "all" || scholarship.country === filters.country;
    
    const matchesStatus =
      !filters.status || filters.status === "all" || scholarship.status === filters.status;

    // Optional field checks for expansion
    const matchesMajor =
      !filters.major ||
      filters.major === "all" ||
      (scholarship as any).major === filters.major;

    const progress = scholarship.goal > 0 ? (scholarship.raised / scholarship.goal) * 100 : 0;
    const matchesProgress =
      filters.minProgress === undefined || progress >= filters.minProgress;

    return matchesQuery && matchesCategory && matchesCountry && matchesStatus && matchesMajor && matchesProgress;
  });
}
