import Link from "next/link"
import { Recycle, Smartphone, Wind, Zap } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export default function RseInvestmentPage() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">RSE Projects</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Explore available sustainability investment initiatives.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        <Link href="/dashboard/rse-investment/nh3-resilient" className="block">
          <Card className="h-full cursor-pointer border-zinc-900/10 bg-white/85 transition-all hover:scale-[1.02] hover:bg-zinc-100 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]">
            <CardContent className="flex h-full min-h-[200px] flex-col items-center justify-center p-8 text-center">
              <Wind className="mb-4 size-16 text-blue-500" />
              <h3 className="text-2xl font-semibold">NH3Resilient</h3>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/rse-investment/smart-waste" className="block">
          <Card className="h-full cursor-pointer border-zinc-900/10 bg-white/85 transition-all hover:scale-[1.02] hover:bg-zinc-100 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]">
            <CardContent className="flex h-full min-h-[200px] flex-col items-center justify-center p-8 text-center">
              <Recycle className="mb-4 size-16 text-emerald-500" />
              <h3 className="text-2xl font-semibold">SmartWaste</h3>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/rse-investment/gaz-optim" className="block">
          <Card className="h-full cursor-pointer border-zinc-900/10 bg-white/85 transition-all hover:scale-[1.02] hover:bg-zinc-100 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]">
            <CardContent className="flex h-full min-h-[200px] flex-col items-center justify-center p-8 text-center">
              <Zap className="mb-4 size-16 text-amber-500" />
              <h3 className="text-2xl font-semibold">GazOptim</h3>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/rse-investment/cyclo" className="block">
          <Card className="h-full cursor-pointer border-zinc-900/10 bg-white/85 transition-all hover:scale-[1.02] hover:bg-zinc-100 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04]">
            <CardContent className="flex h-full min-h-[200px] flex-col items-center justify-center p-8 text-center">
              <Smartphone className="mb-4 size-16 text-rose-500" />
              <h3 className="text-2xl font-semibold">Cyclo</h3>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
