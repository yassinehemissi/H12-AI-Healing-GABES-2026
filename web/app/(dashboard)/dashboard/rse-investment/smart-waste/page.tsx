import Link from "next/link"
import { ExternalLink, Recycle, Route, Truck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PdfExportButton } from "../_components/pdf-export-button"

export default function SmartWastePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PdfExportButton projectId="smart-waste" projectName="SmartWaste" />

      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Recycle className="size-8 text-emerald-500" />
          <h1 className="text-3xl font-bold">Real-Time Smart Waste Collection Optimizer</h1>
        </div>
        <p className="max-w-3xl text-zinc-500 dark:text-zinc-400">
          A smart, data-driven platform for optimizing urban waste management and collection routes. By monitoring real-time bin fill levels alongside intelligent routing algorithms, this dashboard dynamically prioritizes critical intervention points, calculates efficient truck paths, and reduces operational costs for municipalities.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Truck className="size-5 text-blue-500" />
              Active Fleet Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
              24 <span className="text-xl font-normal text-zinc-500">/ 24</span>
            </div>
            <p className="mt-2 text-sm text-zinc-500">All collection trucks are currently active and following optimized routes.</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Route className="size-5 text-indigo-500" />
              Route Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
              +32% Saved
            </div>
            <p className="mt-2 text-sm text-zinc-500">Reduction in operational costs and fuel consumption today.</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
        <CardHeader>
          <CardTitle className="text-center text-xl">Access Full SmartWaste Application</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-8 py-6">
          <Button asChild size="lg" className="h-14 rounded-full px-8 text-lg shadow-lg transition-transform hover:scale-105">
            <Link href="https://comfortable-courage-production-0f87.up.railway.app/?utm_id=97758_v0_s00_e0_tv0&fbclid=IwY2xjawRRST5leHRuA2FlbQIxMABicmlkETFZczFPY2Jwa1MxbEV1T1p4c3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHnaPSEswXo6-S2vrUBJazVLbvV211PjN2kqb182tdFD6H6OZQ7ZKcKGImoGa_aem_zNXa7Ob3nxrM98TKSYmyAw" target="_blank" rel="noopener noreferrer">
              Launch Application <ExternalLink className="ml-2 size-5" />
            </Link>
          </Button>

          <div className="flex flex-col items-center space-y-4">
            <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">Scan to access mobile app</p>
            <div className="rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <img 
                src="/SmartWaste.png" 
                alt="QR Code for SmartWaste" 
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
