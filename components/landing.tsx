import { ArrowRight, Bell, FileCheck2, Search, Wallet } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { contractFlow, features, milestones, navigation, roadmap, scholarships, stats } from "@/lib/data";
import { formatter } from "@/lib/utils";

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#153a63,transparent_35%),radial-gradient(circle_at_top_right,#42206c,transparent_35%),#06111f]">
      <div className="absolute inset-0 bg-grid bg-[length:48px_48px] opacity-30" />
      <div className="relative mx-auto max-w-7xl px-6 py-6 lg:px-8">
        <nav className="flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-aqua to-stellar font-black">SC</div><span className="font-semibold">SkillChain</span></div>
          <div className="hidden gap-6 text-sm text-slate-300 md:flex">{navigation.map((item) => <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`} className="hover:text-white">{item}</a>)}</div>
          <Button>Launch app</Button>
        </nav>

        <section className="grid items-center gap-12 py-24 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <Badge>Stellar + Soroban scholarship infrastructure</Badge>
            <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight md:text-7xl"><span className="gradient-text">Transparent scholarships</span> released by verified academic milestones.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">SkillChain replaces opaque education crowdfunding with milestone-based smart contracts. Donors fund students globally while XLM stays locked in Soroban escrow until proof is approved.</p>
            <div className="mt-8 flex flex-wrap gap-4"><Button>Explore scholarships <ArrowRight className="ml-2 inline size-4" /></Button><Button variant="secondary">Create campaign</Button></div>
          </div>
          <Card className="relative p-5">
            <div className="rounded-2xl bg-gradient-to-br from-white/20 to-white/5 p-5">
              <div className="flex items-center justify-between"><Badge>Live escrow</Badge><span className="text-sm text-mint">Stellar testnet</span></div>
              <h2 className="mt-5 text-2xl font-bold">Amina Okafor — CS Degree</h2>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full w-3/4 rounded-full bg-gradient-to-r from-aqua to-mint" /></div>
              <div className="mt-3 flex justify-between text-sm text-slate-300"><span>375 / 500 XLM funded</span><span>75%</span></div>
              <div className="mt-6 space-y-3">{milestones.map((m) => <div key={m.name} className="flex items-center justify-between rounded-2xl bg-ink/45 p-4"><div><p className="font-medium">{m.name}</p><p className="text-xs text-slate-400">{m.verifier}</p></div><Badge className={m.status === "Approved" ? "border-mint/30 bg-mint/10 text-mint" : ""}>{m.status}</Badge></div>)}</div>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-4">{stats.map((s) => <Card key={s.label}><p className="text-3xl font-black">{s.value}</p><p className="mt-2 font-medium">{s.label}</p><p className="mt-1 text-sm text-slate-400">{s.note}</p></Card>)}</section>

        <section id="explore" className="py-24"><SectionTitle eyebrow="Explore Scholarships" title="Real campaigns with transparent funding progress." /><div className="mt-10 grid gap-5 lg:grid-cols-3">{scholarships.map((s) => <Card key={s.student}><Badge>{s.category}</Badge><h3 className="mt-4 text-xl font-bold">{s.title}</h3><p className="mt-2 text-slate-300">{s.student} • {s.university}, {s.country}</p><div className="mt-5 h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-aqua to-mint" style={{ width: `${(s.raised / s.goal) * 100}%` }} /></div><p className="mt-3 text-sm text-slate-300">{formatter.format(s.raised)} / {formatter.format(s.goal)} XLM • {s.status}</p></Card>)}</div></section>

        <section id="how-it-works" className="py-12"><SectionTitle eyebrow="Smart contracts" title="Five modular contracts coordinate identity, donations, verification and release." /><div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-5">{contractFlow.map(({ icon: Icon, ...c }) => <Card key={c.title}><Icon className="size-8 text-mint" /><h3 className="mt-4 font-bold">{c.title}</h3><p className="mt-2 text-sm text-slate-300">{c.text}</p></Card>)}</div></section>

        <section id="milestones" className="grid gap-8 py-24 lg:grid-cols-2"><div><SectionTitle eyebrow="Verification" title="Every release requires approved proof." /><p className="mt-4 text-slate-300">Universities, NGOs, authorized mentors and admins review PDFs, images, certificates and attendance reports. Status changes emit on-chain events such as MilestoneApproved and FundsReleased.</p></div><Card><div className="grid gap-4 sm:grid-cols-2">{features.map(({ icon: Icon, title, text }) => <div key={title} className="rounded-2xl bg-white/5 p-4"><Icon className="size-6 text-aqua" /><h3 className="mt-3 font-semibold">{title}</h3><p className="mt-2 text-sm text-slate-400">{text}</p></div>)}</div></Card></section>

        <section id="analytics" className="py-12"><SectionTitle eyebrow="Operations" title="Production MVP essentials are built in." /><div className="mt-10 grid gap-5 md:grid-cols-3"><Card><Wallet className="text-mint" /><h3 className="mt-4 text-xl font-bold">10+ wallet interactions</h3><p className="text-slate-300">Connect, authenticate, donate, sign escrow, verify milestone, release funds and inspect history.</p></Card><Card><Bell className="text-mint" /><h3 className="mt-4 text-xl font-bold">Real-time notifications</h3><p className="text-slate-300">Firestore listeners power donation, approval, release and campaign-funded alerts.</p></Card><Card><Search className="text-mint" /><h3 className="mt-4 text-xl font-bold">Search and filters</h3><p className="text-slate-300">Filter by category, country, university, funding goal and scholarship status.</p></Card></div></section>

        <section id="roadmap" className="py-24"><SectionTitle eyebrow="Roadmap" title="From MVP to global fiat rails." /><div className="mt-10 grid gap-5 md:grid-cols-3">{roadmap.map((r) => <Card key={r.phase}><h3 className="text-xl font-bold">{r.phase}</h3><ul className="mt-4 space-y-2 text-sm text-slate-300">{r.items.map((i) => <li key={i} className="flex gap-2"><FileCheck2 className="size-4 text-mint" />{i}</li>)}</ul></Card>)}</div></section>
      </div>
    </main>
  );
}

function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) { return <div><Badge>{eyebrow}</Badge><h2 className="mt-4 max-w-3xl text-3xl font-black tracking-tight md:text-5xl">{title}</h2></div>; }
