import Link from "next/link"
import { Activity, ExternalLink, ShieldAlert, Wind } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PdfExportButton } from "../_components/pdf-export-button"

export default function NH3ResilientPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PdfExportButton projectId="nh3-resilient" projectName="NH3Resilient" />

      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Wind className="size-8 text-blue-500" />
          <h1 className="text-3xl font-bold">NH3Resilient Dashboard</h1>
        </div>
        <p className="max-w-3xl text-zinc-500 dark:text-zinc-400">
          A predictive, advanced environmental monitoring system designed to track, simulate, and manage NH3 (Ammonia) emissions across industrial zones. By combining real-time sensor data and AI-driven dispersion models, NH3Resilient ensures precise intervention, regulatory compliance, and community safety.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="size-5 text-emerald-500" />
              Current NH3 Concentration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              0.04 <span className="text-xl font-normal text-zinc-500">ppm</span>
            </div>
            <p className="mt-2 text-sm text-zinc-500">Stable levels detected in the industrial zone. Well below safety thresholds.</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldAlert className="size-5 text-amber-500" />
              Risk Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              Low Risk
            </div>
            <p className="mt-2 text-sm text-zinc-500">No dispersion anomalies detected in the last 24 hours.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
        <CardHeader>
          <CardTitle className="text-center text-xl">Access Full NH3Resilient Application</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-8 py-6">
          <Button asChild size="lg" className="h-14 rounded-full px-8 text-lg shadow-lg transition-transform hover:scale-105">
            <Link href="https://clever-bravery-production.up.railway.app/" target="_blank" rel="noopener noreferrer">
              Launch Application <ExternalLink className="ml-2 size-5" />
            </Link>
          </Button>

          <div className="flex flex-col items-center space-y-4">
            <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">Scan to access mobile app</p>
            <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <img 
                src="/NH3Resilient.png" 
                alt="QR Code for NH3Resilient" 
                className="size-48 object-contain"
              />
            </div>
            <p className="text-xs text-zinc-400">Place your image in the public folder</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
