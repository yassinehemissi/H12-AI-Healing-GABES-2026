import { Construction, Factory, Flame, Zap } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function GazOptimPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Zap className="size-8 text-amber-500" />
          <h1 className="text-3xl font-bold">GazOptim Dashboard</h1>
        </div>
        <p className="max-w-3xl text-zinc-500 dark:text-zinc-400">
          A proven, science-backed approach for transforming industrial waste into electricity, heat, and combustible gas. By converting residual materials through thermal and biological processes alongside circular economy principles, this solution actively reduces industrial pollution, generates local energy, and replaces fossil fuels at the source.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Flame className="size-5 text-orange-500" />
              Thermal Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tight text-orange-600 dark:text-orange-400">
              -- <span className="text-xl font-normal text-zinc-500">%</span>
            </div>
            <p className="mt-2 text-sm text-zinc-500">Sensors are currently awaiting connection telemetry.</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Factory className="size-5 text-zinc-500" />
              Energy Output Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-zinc-600 dark:text-zinc-400">
              Initializing...
            </div>
            <p className="mt-2 text-sm text-zinc-500">Models are synchronizing with baseline operational data.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-zinc-900/10 bg-amber-50/50 dark:border-white/10 dark:bg-amber-500/[0.02]">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center text-amber-600 dark:text-amber-500">
          <div className="mb-6 rounded-full bg-amber-100 p-4 dark:bg-amber-500/10">
            <Construction className="size-12 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold">Deployment in Progress</h2>
          <p className="mt-2 max-w-md text-amber-700/80 dark:text-amber-500/80">
            The full GazOptim application and control dashboard are currently being deployed to production servers. Check back shortly to access live telemetry and tracking.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
