import Link from "next/link";
import { Button } from "@/components/ui";
export default function NotFound() { return <main className="grid min-h-screen place-items-center bg-ink p-6 text-center text-white"><div><p className="text-mint">404</p><h1 className="mt-3 text-5xl font-black">Scholarship not found</h1><p className="mt-3 text-slate-300">The campaign may have been moved, completed or archived.</p><Link href="/scholarships" className="mt-6 inline-block"><Button>Explore scholarships</Button></Link></div></main>; }
