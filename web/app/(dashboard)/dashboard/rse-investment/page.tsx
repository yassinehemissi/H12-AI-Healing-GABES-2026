import Link from "next/link"
import { Recycle, Smartphone, Wind, Zap } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export default function RseInvestmentPage() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
      <Link href="/dashboard/rse-investment/nh3-resilient" className="block">
        <Card className="cursor-pointer border-zinc-900/10 bg-white/85 transition-all hover:scale-[1.02] hover:bg-zinc-100 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] h-full">
          <CardContent className="flex min-h-[200px] flex-col items-center justify-center p-8 text-center h-full">
            <Wind className="mb-4 size-16 text-blue-500" />
            <h3 className="text-2xl font-semibold">NH3Resilient</h3>
          </CardContent>
        </Card>
      </Link>

      <Link href="/dashboard/rse-investment/smart-waste" className="block">
        <Card className="cursor-pointer border-zinc-900/10 bg-white/85 transition-all hover:scale-[1.02] hover:bg-zinc-100 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] h-full">
          <CardContent className="flex min-h-[200px] flex-col items-center justify-center p-8 text-center h-full">
            <Recycle className="mb-4 size-16 text-emerald-500" />
            <h3 className="text-2xl font-semibold">SmartWaste</h3>
          </CardContent>
        </Card>
      </Link>

      <Link href="/dashboard/rse-investment/gaz-optim" className="block">
        <Card className="cursor-pointer border-zinc-900/10 bg-white/85 transition-all hover:scale-[1.02] hover:bg-zinc-100 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] h-full">
          <CardContent className="flex min-h-[200px] flex-col items-center justify-center p-8 text-center h-full">
            <Zap className="mb-4 size-16 text-amber-500" />
            <h3 className="text-2xl font-semibold">GazOptim</h3>
          </CardContent>
        </Card>
      </Link>

      <Link href="/dashboard/rse-investment/cyclo" className="block">
        <Card className="cursor-pointer border-zinc-900/10 bg-white/85 transition-all hover:scale-[1.02] hover:bg-zinc-100 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] h-full">
          <CardContent className="flex min-h-[200px] flex-col items-center justify-center p-8 text-center h-full">
            <Smartphone className="mb-4 size-16 text-rose-500" />
            <h3 className="text-2xl font-semibold">Cyclo</h3>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}
