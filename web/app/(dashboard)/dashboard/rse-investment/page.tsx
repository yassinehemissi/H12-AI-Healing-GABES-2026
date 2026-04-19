import { Recycle, Smartphone, Wind, Zap } from "lucide-react"
import { InvestmentCard } from "./_components/investment-card"

export default function RseInvestmentPage() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
      <InvestmentCard 
        projectId="nh3-resilient" 
        title="NH3Resilient" 
        icon={<Wind className="h-full w-full" />} 
        colorClass="text-blue-500" 
      />
      <InvestmentCard 
        projectId="smart-waste" 
        title="SmartWaste" 
        icon={<Recycle className="h-full w-full" />} 
        colorClass="text-emerald-500" 
      />
      <InvestmentCard 
        projectId="gaz-optim" 
        title="GazOptim" 
        icon={<Zap className="h-full w-full" />} 
        colorClass="text-amber-500" 
      />
      <InvestmentCard 
        projectId="cyclo" 
        title="Cyclo" 
        icon={<Smartphone className="h-full w-full" />} 
        colorClass="text-rose-500" 
      />
    </div>
  )
}
