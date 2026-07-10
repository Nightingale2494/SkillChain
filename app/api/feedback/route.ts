import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/client";
export async function POST(request: Request) { const body = await request.json(); if (!body.message || !body.email) return NextResponse.json({ error: "Email and message are required" }, { status: 400 }); const ref = await addDoc(collection(db, "feedback"), { email: body.email, message: body.message, route: body.route ?? null, createdAt: serverTimestamp() }); return NextResponse.json({ ok: true, id: ref.id }); }
