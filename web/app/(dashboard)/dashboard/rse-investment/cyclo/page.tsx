import Link from "next/link"
import { ExternalLink, Smartphone, Users, LeafyGreen } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CycloPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Smartphone className="size-8 text-rose-500" />
          <h1 className="text-3xl font-bold">Cyclo User Platform</h1>
        </div>
        <p className="max-w-3xl text-zinc-500 dark:text-zinc-400">
          A smart, user-centered mobile application for making environmental responsibility accessible, visual, and engaging for everyday citizens. By combining waste identification, recycling guidance, pollution transparency, and creative upcycling alongside an intelligent assistant, this app actively empowers users to act sustainably, participate civically, and reimagine discarded materials in a single mobile experience.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="size-5 text-indigo-500" />
              Active Citizens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
              12,450
            </div>
            <p className="mt-2 text-sm text-zinc-500">Engaged users participating in local sustainability this month.</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <LeafyGreen className="size-5 text-emerald-500" />
              Items Upcycled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
              3,205
            </div>
            <p className="mt-2 text-sm text-zinc-500">Materials repurposed through community actions and guidance.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
        <CardHeader>
          <CardTitle className="text-center text-xl">Access Full Cyclo Application</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-8 py-6">
          <Button asChild size="lg" className="h-14 rounded-full px-8 text-lg shadow-lg transition-transform hover:scale-105">
            <Link href="https://cyclo-app-demo.railway.app/" target="_blank" rel="noopener noreferrer">
              Launch Application <ExternalLink className="ml-2 size-5" />
            </Link>
          </Button>

          <div className="flex flex-col items-center space-y-4">
            <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">Scan to download app</p>
            <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <img 
                src="/mobile.png" 
                alt="QR Code for Cyclo App" 
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
