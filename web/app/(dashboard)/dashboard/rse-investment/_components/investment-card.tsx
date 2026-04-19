"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

type InvestmentCardProps = {
  projectId: string
  title: string
  icon: React.ReactNode
  colorClass: string
}

export function InvestmentCard({ projectId, title, icon, colorClass }: InvestmentCardProps) {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  
  const handleInvest = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const value = parseFloat(amount)
    if (isNaN(value) || value <= 0) return

    // add to previous total
    const key = `invest_${projectId}`
    const previousRaw = localStorage.getItem(key)
    const previousValue = previousRaw ? parseFloat(previousRaw) : 0
    localStorage.setItem(key, (previousValue + value).toString())
    
    setAmount("")
    toast.success(`Investissement de ${value} DT ajouté à ${title} !`)
    router.push(`/dashboard/rse-investment/${projectId}`)
  }

  const handleCardClick = () => {
    router.push(`/dashboard/rse-investment/${projectId}`)
  }

  return (
    <Card 
      onClick={handleCardClick}
      className="cursor-pointer flex flex-col justify-between border-zinc-900/10 bg-white/85 transition-all hover:scale-[1.02] hover:bg-zinc-100 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.02] dark:hover:bg-white/[0.04] h-full overflow-hidden"
    >
      <CardContent className="flex flex-col items-center justify-center p-8 text-center flex-grow pt-10">
        <div className={`mb-4 size-16 ${colorClass}`}>
          {icon}
        </div>
        <h3 className="text-2xl font-semibold">{title}</h3>
      </CardContent>

      <div 
        className="p-4 border-t border-zinc-200/50 dark:border-white/5 bg-zinc-50/50 dark:bg-black/10 transition-colors hover:bg-zinc-100 dark:hover:bg-black/20"
        onClick={(e) => e.stopPropagation()} // Prevent card click when clicking input area
      >
        <form onSubmit={handleInvest} className="space-y-3">
          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-[0.1em] text-center">Investir (DT)</p>
          <div className="flex flex-col gap-2 relative">
            <Input 
              type="number"
              placeholder="Montant DT" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-white dark:bg-zinc-950/50 w-full rounded-xl text-center h-10"
              required
              min="1"
            />
            <Button type="submit" variant="default" size="sm" className="w-full h-10 rounded-xl font-semibold shadow-sm">
              Soumettre
            </Button>
          </div>
        </form>
      </div>
    </Card>
  )
}
