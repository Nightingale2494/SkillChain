"use client";
import { Button } from "@/components/ui";
export default function Error({ error, reset }: { error: Error; reset: () => void }) { return <div className="grid min-h-screen place-items-center bg-ink p-6 text-white"><div className="max-w-lg rounded-3xl border border-red-300/20 bg-red-950/30 p-8"><h1 className="text-3xl font-black">Something went wrong</h1><p className="mt-3 text-red-100">{error.message}</p><div className="mt-6"><Button onClick={reset}>Try again</Button></div></div></div>; }
