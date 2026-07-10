import { NextResponse } from "next/server";
export async function POST(request: Request) { const body = await request.json(); if (!body.message || !body.email) return NextResponse.json({ error: "Email and message are required" }, { status: 400 }); return NextResponse.json({ ok: true, id: crypto.randomUUID() }); }
