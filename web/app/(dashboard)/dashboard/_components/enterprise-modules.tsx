import {
  BadgeDollarSign,
  BrainCircuit,
  Building2,
  ChartLine,
  FlaskConical,
  Globe,
  Scale,
  ShieldCheck,
  Wind,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const rseProjects = [
  { title: "Clean Air Corridors", roi: "18.4%", compliance: "EU ESG + Tunisian law", score: 82 },
  { title: "Industrial NH3 Capture", roi: "22.1%", compliance: "ISO 14001", score: 76 },
  { title: "Circular Plastics Hub", roi: "16.3%", compliance: "CSRD aligned", score: 69 },
]

type EnterpriseModulesProps = {
  subscriptionActive: boolean
}

function SubscriptionGate() {
  return (
    <Card className="border-amber-300/40 bg-amber-300/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <BadgeDollarSign className="size-5 text-amber-600" />
          Enterprise subscription required
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-700 dark:text-zinc-200">
          Unlock Amalin intelligence, RSE investment ideas, compliance audit and orchestration.
        </p>
        <Button className="bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950">
          Activate enterprise subscription
        </Button>
      </CardContent>
    </Card>
  )
}

function EnterpriseContent() {
  return (
    <>
      <div className="grid gap-3 xl:grid-cols-4">
        <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]"><CardContent className="pt-5"><p className="text-xs text-zinc-500 dark:text-zinc-400">Forecast ROI pipeline</p><p className="mt-1 text-2xl font-semibold">+21.4%</p></CardContent></Card>
        <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]"><CardContent className="pt-5"><p className="text-xs text-zinc-500 dark:text-zinc-400">Compliance confidence</p><p className="mt-1 text-2xl font-semibold">96/100</p></CardContent></Card>
        <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]"><CardContent className="pt-5"><p className="text-xs text-zinc-500 dark:text-zinc-400">Scientific datasets synced</p><p className="mt-1 text-2xl font-semibold">47</p></CardContent></Card>
        <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]"><CardContent className="pt-5"><p className="text-xs text-zinc-500 dark:text-zinc-400">Agentic strategies active</p><p className="mt-1 text-2xl font-semibold">12</p></CardContent></Card>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BrainCircuit className="size-5 text-indigo-600" />
              Amalin Intelligence System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-2xl border border-zinc-900/10 bg-white/85 p-3 dark:border-white/10 dark:bg-black/20">
              <p className="font-medium">Game-theory orchestration</p>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">Multi-agent negotiation and equilibrium scenario ranking.</p>
            </div>
            <div className="rounded-2xl border border-zinc-900/10 bg-white/85 p-3 dark:border-white/10 dark:bg-black/20">
              <p className="font-medium">Compliance + audit</p>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">Law-aware recommendations with full decision traceability.</p>
            </div>
            <div className="rounded-2xl border border-zinc-900/10 bg-white/85 p-3 dark:border-white/10 dark:bg-black/20">
              <p className="font-medium">Scientific update feed</p>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">Continuous synchronization with current scientific references.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Building2 className="size-5 text-emerald-600" />
              RSE projects: ideas + investment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {rseProjects.map((project) => (
              <div key={project.title} className="rounded-2xl border border-zinc-900/10 bg-white/85 p-3 dark:border-white/10 dark:bg-black/20">
                <p className="text-sm font-medium">{project.title}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <p>ROI: {project.roi}</p>
                  <p>Amalin score: {project.score}</p>
                  <p className="col-span-2">{project.compliance}</p>
                </div>
                <Progress value={project.score} className="mt-2 h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
        <CardHeader>
          <CardTitle className="text-lg">Enterprise capability map</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-900/10 bg-white/85 p-3 dark:border-white/10 dark:bg-black/20"><p className="mb-1 flex items-center gap-2 font-medium"><Scale className="size-4 text-amber-600" />Laws compliance engine</p><p className="text-zinc-600 dark:text-zinc-400">Continuous legal checks and policy-aware deployment recommendations.</p></div>
          <div className="rounded-2xl border border-zinc-900/10 bg-white/85 p-3 dark:border-white/10 dark:bg-black/20"><p className="mb-1 flex items-center gap-2 font-medium"><FlaskConical className="size-4 text-cyan-600" />Scientific update feed</p><p className="text-zinc-600 dark:text-zinc-400">Current peer-reviewed data ingestion for strategy recalibration.</p></div>
          <div className="rounded-2xl border border-zinc-900/10 bg-white/85 p-3 dark:border-white/10 dark:bg-black/20"><p className="mb-1 flex items-center gap-2 font-medium"><ChartLine className="size-4 text-emerald-600" />ROI and audit cockpit</p><p className="text-zinc-600 dark:text-zinc-400">Investment outcomes, scenario comparison, and automated audit reports.</p></div>
          <div className="rounded-2xl border border-zinc-900/10 bg-white/85 p-3 dark:border-white/10 dark:bg-black/20"><p className="mb-1 flex items-center gap-2 font-medium"><ShieldCheck className="size-4 text-violet-600" />Security controls</p><p className="text-zinc-600 dark:text-zinc-400">Role segmentation and signed decision logs.</p></div>
          <div className="rounded-2xl border border-zinc-900/10 bg-white/85 p-3 dark:border-white/10 dark:bg-black/20"><p className="mb-1 flex items-center gap-2 font-medium"><Wind className="size-4 text-sky-600" />Atmosphere simulation</p><p className="text-zinc-600 dark:text-zinc-400">Predictive atmospheric diffusion models for intervention planning.</p></div>
          <div className="rounded-2xl border border-zinc-900/10 bg-white/85 p-3 dark:border-white/10 dark:bg-black/20"><p className="mb-1 flex items-center gap-2 font-medium"><Globe className="size-4 text-emerald-600" />Multi-region operations</p><p className="text-zinc-600 dark:text-zinc-400">Central governance with localized legal and environmental context.</p></div>
        </CardContent>
      </Card>
    </>
  )
}

export function EnterpriseModules({ subscriptionActive }: EnterpriseModulesProps) {
  return (
    <div className="grid gap-3">
      {subscriptionActive ? <EnterpriseContent /> : <SubscriptionGate />}
      <div className="rounded-3xl border border-zinc-900/10 bg-white/80 px-4 py-3 text-xs text-zinc-600 dark:border-white/10 dark:bg-white/[0.02] dark:text-zinc-400">
        Enterprise requires subscription. Citizen dashboard is completely free.
      </div>
    </div>
  )
}
