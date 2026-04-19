"use client"

import { useState, useEffect } from "react"
import jsPDF from "jspdf"
import autoTable from 'jspdf-autotable' 
import { DownloadCloud, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"

export function PdfExportButton({ projectId, projectName }: { projectId: string; projectName: string }) {
  const [amount, setAmount] = useState<number | null>(null)

  useEffect(() => {
    // Read investment amount from localstorage
    const key = `invest_${projectId}`
    const stored = localStorage.getItem(key)
    if (stored) {
      setAmount(parseFloat(stored))
    }
  }, [projectId])

  const generatePDF = async () => {
    if (!amount) return

    const doc = new jsPDF()

    const logoBase64 = await getBase64ImageFromUrl('/LOGO.png')
    if (logoBase64) {
      doc.addImage(logoBase64, 'PNG', 15, 10, 20, 20)
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.text("FACTURE D'INVESTISSEMENT RSE", 40, 22)
    
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text("GABBiEST Plateforme d'Intelligence Environnementale", 40, 27)

    doc.setDrawColor(200)
    doc.line(15, 35, 195, 35)

    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.text(`Rapport émis le : ${new Date().toLocaleDateString("fr-FR")}`, 15, 45)
    doc.text(`Projet Ciblé : ${projectName}`, 15, 52)
    
    autoTable(doc, {
      startY: 65,
      head: [['Description', 'Date de soumission', 'Montant Investi (DT)']],
      body: [
        [`Soutien Officiel RSE - ${projectName}`, new Date().toLocaleDateString("fr-FR"), `${amount.toLocaleString("fr-FR")} DT`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [5, 46, 22] }, // Emerald dark tint
      styles: { fontSize: 11 }
    })

    const finalY = (doc as any).lastAutoTable.finalY + 20
    doc.setFontSize(10)
    doc.setTextColor(80)
    doc.text("Merci pour votre contribution essentielle au développement durable de l'écosystème de Gabès.", 15, finalY)
    doc.text("Ce document est généré automatiquement et fait office de reçu.", 15, finalY + 5)

    doc.save(`Facture_RSE_${projectId}_${new Date().getTime()}.pdf`)
  }

  if (!amount || amount <= 0) return null

  return (
    <div className="flex flex-col items-center sm:flex-row sm:items-center justify-between p-4 mb-6 rounded-2xl bg-emerald-50/70 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/40">
      <div className="flex items-center gap-4 mb-3 sm:mb-0">
        <div className="p-2.5 bg-emerald-100 rounded-full text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
          <FileText className="size-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-emerald-950 dark:text-emerald-100">Fonds Investis dans ce projet</p>
          <p className="text-2xl font-bold tracking-tight text-emerald-700 dark:text-emerald-400">{amount.toLocaleString("fr-FR")} DT</p>
        </div>
      </div>
      <Button onClick={generatePDF} className="gap-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 shadow-md">
        <DownloadCloud className="size-4" />
        Télécharger la Facture PDF
      </Button>
    </div>
  )
}

async function getBase64ImageFromUrl(imageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(imageUrl);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error("Failed to load image for PDF", e);
    return null;
  }
}
