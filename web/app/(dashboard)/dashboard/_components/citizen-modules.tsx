import { BellRing, Bot, MapPin, Recycle } from "lucide-react"

import { GabesEnvironmentalMap } from "@/components/maps/gabes-environmental-map"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

const airNotifications = [
  { zone: "Gabes Downtown", level: "Unhealthy", aqi: 162, note: "Avoid outdoor sports" },
  { zone: "Industrial Belt", level: "Hazardous", aqi: 212, note: "Mask recommended" },
  { zone: "Coastal Zone", level: "Moderate", aqi: 86, note: "Normal activity" },
]

const recyclingFacts = [
  { label: "Today's recycled waste", value: "3.8 t" },
  { label: "Plastic diversion rate", value: "42%" },
  { label: "Community points earned", value: "1,260 pts" },
]

export function CitizenModules() {
  return (
    <div className="grid gap-3 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="xl:col-span-2">
        <GabesEnvironmentalMap />
      </div>

      <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BellRing className="size-5 text-rose-500" />
            Air quality notifications (position-based)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {airNotifications.map((item) => (
            <div key={item.zone} className="rounded-2xl border border-zinc-900/10 bg-white/85 p-3 dark:border-white/10 dark:bg-black/20">
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-sm font-medium">
                  <MapPin className="size-4 text-cyan-600" />
                  {item.zone}
                </p>
                <Badge className="rounded-full border-zinc-900/15 bg-white/70 px-2.5 dark:border-white/10 dark:bg-white/[0.04]">
                  AQI {item.aqi}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{item.level}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{item.note}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-zinc-900/10 bg-white/85 dark:border-white/10 dark:bg-white/[0.02]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Recycle className="size-5 text-emerald-600" />
            Recycling information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recyclingFacts.map((fact) => (
            <div key={fact.label} className="rounded-2xl border border-zinc-900/10 bg-white/80 p-3 dark:border-white/10 dark:bg-black/20">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">{fact.label}</p>
              <p className="mt-1 text-xl font-semibold">{fact.value}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-zinc-900/10 bg-white/85 xl:col-span-2 dark:border-white/10 dark:bg-white/[0.02]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bot className="size-5 text-violet-600" />
            Citizen chatbot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="knowledge">
            <TabsList className="grid h-auto w-full grid-cols-3 rounded-2xl bg-zinc-100 p-1 dark:bg-white/[0.05]">
              <TabsTrigger value="knowledge" className="rounded-xl">
                Knowledge
              </TabsTrigger>
              <TabsTrigger value="prompts" className="rounded-xl">
                Prompts
              </TabsTrigger>
              <TabsTrigger value="chat" className="rounded-xl">
                Chat
              </TabsTrigger>
            </TabsList>
            <TabsContent value="knowledge" className="mt-3 space-y-2 text-sm">
              <p>- Air quality index interpretation and personal protection guidance.</p>
              <p>- Neighborhood recycling points, collection windows, and sorting rules.</p>
              <p>- Health-sensitive recommendations for kids, elderly, and asthma cases.</p>
            </TabsContent>
            <TabsContent value="prompts" className="mt-3 space-y-2 text-sm">
              <p>- &quot;What should I do today if AQI is above 150?&quot;</p>
              <p>- &quot;Where is the nearest plastic collection station from my location?&quot;</p>
              <p>- &quot;Give me a 7-day eco plan for my household.&quot;</p>
            </TabsContent>
            <TabsContent value="chat" className="mt-3 space-y-3">
              <Textarea
                placeholder="Ask the chatbot anything about air quality or recycling..."
                className="min-h-28 border-zinc-900/15 bg-white/80 dark:border-white/10 dark:bg-white/[0.03]"
              />
              <div className="flex justify-end">
                <Button>Send to chatbot</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
