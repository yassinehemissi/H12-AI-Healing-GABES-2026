import Link from "next/link"
import {
  ArrowRight,
  Bot,
  Brain,
  Building2,
  CheckCircle2,
  Leaf,
  LineChart,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { signOutAction } from "@/app/(auth)/actions"
import { links } from "@/constants/links"
import { getCurrentUser } from "@/lib/auth/auth"

const metrics = [
  { label: "Cities monitored", value: "24" },
  { label: "Live signals", value: "1.8M/day" },
  { label: "Active projects", value: "138" },
  { label: "CO2 mitigated", value: "42.8 kt" },
]

const features = [
  {
    title: "Unified observability",
    body: "Aggregate environment, field, and operations data in one command surface.",
    icon: LineChart,
  },
  {
    title: "AI copilot workflows",
    body: "Turn raw signals into prioritized actions with explainable AI guidance.",
    icon: Bot,
  },
  {
    title: "Enterprise controls",
    body: "Role-aware spaces, auditable actions, and policy-safe automations.",
    icon: ShieldCheck,
  },
]

const plans = [
  {
    key: "normal",
    title: "Normal user",
    subtitle: "For contributors and local teams",
    points: ["Personal dashboard", "Project participation", "AI assistant access"],
  },
  {
    key: "enterprise",
    title: "Enterprise",
    subtitle: "For orgs and operations teams",
    points: ["Multi-team workspaces", "Advanced analytics", "Policy + compliance layer"],
  },
]

export default async function HomePage() {
  const currentUser = await getCurrentUser()

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f7f7f2] text-zinc-950">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(24,24,27,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(24,24,27,0.08)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="pointer-events-none absolute -left-24 top-20 h-[420px] w-[420px] rounded-full bg-emerald-300/30 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-[360px] w-[460px] rounded-full bg-cyan-300/25 blur-3xl" />

      <div className="relative mx-auto flex w-full max-w-[1320px] flex-col px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-4xl border border-zinc-900/10 bg-white/70 px-4 py-3 backdrop-blur-sm">
          <Link href={links.guest.home} className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-2xl bg-zinc-950 text-white">
              <Leaf className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">GABBiEST</p>
              <p className="text-xs text-zinc-500">AI Healing Platform</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link className="text-sm text-zinc-700 hover:text-zinc-950" href="#features">
              Features
            </Link>
            <Link className="text-sm text-zinc-700 hover:text-zinc-950" href="#plans">
              Plans
            </Link>
            <Link className="text-sm text-zinc-700 hover:text-zinc-950" href="#workflow">
              Workflow
            </Link>
          </nav>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" className="border-zinc-300 bg-white/80">
                <Link href={links.guest.dashboard}>Dashboard</Link>
              </Button>
              <form action={signOutAction}>
                <Button type="submit" className="bg-zinc-950 text-white hover:bg-zinc-800">
                  Logout
                </Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="outline" className="border-zinc-300 bg-white/80">
                <Link href={links.guest.signIn}>Sign in</Link>
              </Button>
              <Button asChild className="bg-zinc-950 text-white hover:bg-zinc-800">
                <Link href={links.guest.signUp}>
                  Start now
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          )}
        </header>

        <section className="mt-10 grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <Badge className="rounded-full border-emerald-600/30 bg-emerald-100 text-emerald-800">
              <Sparkles className="size-3.5" />
              New design system rollout
            </Badge>
            <h1 className="font-heading text-5xl leading-[0.94] tracking-tight sm:text-6xl lg:text-7xl">
              Climate operations,
              <br />
              redesigned for
              <span className="text-emerald-700"> speed</span>.
            </h1>
            <p className="max-w-2xl text-lg text-zinc-600">
              Build projects, monitor impact, and coordinate teams from one intelligent
              workspace powered by your Mongo-backed auth system.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="bg-zinc-950 text-white hover:bg-zinc-800">
                <Link href={links.guest.dashboard}>
                  Open dashboard
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-zinc-300 bg-white/80">
                <Link href={links.guest.signUp}>Create account</Link>
              </Button>
            </div>
          </div>

          <Card className="border-zinc-900/10 bg-white/85 shadow-2xl">
            <CardHeader>
              <CardTitle>Live command card</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-3xl border border-zinc-900/10 bg-zinc-950 p-4 text-zinc-100">
                <p className="text-sm text-zinc-400">Realtime signal score</p>
                <p className="mt-1 text-4xl font-semibold">94.2%</p>
                <p className="mt-2 text-xs text-emerald-300">+5.6% this week</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {metrics.map((item) => (
                  <div key={item.label} className="rounded-3xl border border-zinc-900/10 bg-white p-3">
                    <p className="text-xs text-zinc-500">{item.label}</p>
                    <p className="mt-1 text-xl font-semibold">{item.value}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section id="features" className="mt-14">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Features</p>
              <h2 className="mt-1 font-heading text-3xl">Built for action, not dashboards only</h2>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-zinc-900/10 bg-white/85">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <feature.icon className="size-5 text-emerald-700" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-zinc-600">{feature.body}</CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="plans" className="mt-14 grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="border-zinc-900/10 bg-white/85">
            <CardHeader>
              <CardTitle>Account modes integrated with your auth flow</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="normal" className="w-full">
                <TabsList className="grid h-auto w-full grid-cols-2 rounded-3xl bg-zinc-100 p-1">
                  {plans.map((plan) => (
                    <TabsTrigger key={plan.key} value={plan.key} className="rounded-2xl py-2">
                      {plan.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {plans.map((plan) => (
                  <TabsContent key={plan.key} value={plan.key} className="mt-4 space-y-3">
                    <p className="text-sm text-zinc-600">{plan.subtitle}</p>
                    {plan.points.map((point) => (
                      <div key={point} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="size-4 text-emerald-700" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card id="workflow" className="border-zinc-900/10 bg-zinc-950 text-zinc-100">
            <CardHeader>
              <CardTitle className="text-zinc-50">Operational workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 grid size-8 place-items-center rounded-full bg-emerald-300 text-zinc-900">
                  <Users className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">1. Team onboarding</p>
                  <p className="text-sm text-zinc-400">Users register with role-specific access.</p>
                </div>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-start gap-3">
                <div className="mt-1 grid size-8 place-items-center rounded-full bg-cyan-300 text-zinc-900">
                  <Brain className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">2. AI analysis loop</p>
                  <p className="text-sm text-zinc-400">Surface anomalies and prioritize actions.</p>
                </div>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex items-start gap-3">
                <div className="mt-1 grid size-8 place-items-center rounded-full bg-amber-300 text-zinc-900">
                  <Building2 className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">3. Enterprise governance</p>
                  <p className="text-sm text-zinc-400">Track KPIs and compliance from one panel.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  )
}
