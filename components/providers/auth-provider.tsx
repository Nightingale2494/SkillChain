"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";

import { auth, db } from "@/lib/firebase/client";
import type { UserProfile } from "@/lib/types";
import { AuthModal } from "@/components/shared/auth-modal";

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  setAuthModalOpen(open: boolean): void;
  signInWithGoogle(): Promise<void>;
  signInWithEmail(email: string, password: string): Promise<void>;
  signUpWithEmail(email: string, name: string, password: string): Promise<void>;
  signOutUser(): Promise<void>;
  updateUserProfile(data: Partial<UserProfile>): Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  // Listen to Auth State
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      // Check/Setup Firestore Document
      if (db) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          const newProfile = {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
            email: firebaseUser.email || "",
            avatar: firebaseUser.photoURL || "",
            role: "unassigned",
            wallet: "",
            country: "",
            bio: "Registered on SkillChain",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await setDoc(userDocRef, newProfile);
        }

        // Live subscription to user profile changes
        const unsubscribeProfile = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          }
          setLoading(false);
        });

        return () => {
          unsubscribeProfile();
        };
      } else {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // Redirection logic for "unassigned" users
  useEffect(() => {
    if (
      !isLoading &&
      user &&
      profile &&
      profile.role === "unassigned" &&
      pathname !== "/profile"
    ) {
      router.replace("/profile");
    }
  }, [isLoading, user, profile, pathname, router]);

  const value: AuthContextValue = {
    user,
    profile,
    isLoading,
    isAuthModalOpen,
    setAuthModalOpen,

    async signInWithGoogle() {
      if (!auth) throw new Error("Firebase Auth is not initialized");
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    },

    async signInWithEmail(email, password) {
      if (!auth) throw new Error("Firebase Auth is not initialized");
      await signInWithEmailAndPassword(auth, email, password);
    },

    async signUpWithEmail(email, name, password) {
      if (!auth || !db) throw new Error("Firebase Auth/Firestore is not initialized");
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Manually set custom profile document upon successful account creation
      const userDocRef = doc(db, "users", newUser.uid);
      await setDoc(userDocRef, {
        id: newUser.uid,
        name: name || email.split("@")[0],
        email: email,
        avatar: "",
        role: "unassigned",
        wallet: "",
        country: "",
        bio: "Registered on SkillChain via Email",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    },

    async signOutUser() {
      if (!auth) throw new Error("Firebase Auth is not initialized");
      await signOut(auth);
      router.push("/");
    },

    async updateUserProfile(data: Partial<UserProfile>) {
      if (!user || !db) throw new Error("User is not authenticated");
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(
        userDocRef,
        {
          ...data,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
