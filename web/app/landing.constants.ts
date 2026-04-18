import {
  Activity,
  Bot,
  ChartNoAxesCombined,
  Clock3,
  Factory,
  FileText,
  FolderKanban,
  Gauge,
  Leaf,
  Map,
  Recycle,
  Settings2,
  Sparkles,
  Users,
  LayoutDashboard,
} from "lucide-react";

export const landingNavItems = ["Accueil", "Fonctionnalites", "Projets"];

export const heroFootnotes = [
  { title: "Donnees", subtitle: "en temps reel", icon: Activity },
  { title: "IA & Analyse", subtitle: "avancee", icon: Sparkles },
  { title: "Projets a", subtitle: "fort impact", icon: Recycle },
  { title: "Impact mesurable", subtitle: "& reporting RSE", icon: Gauge },
];

export const dashboardStats = [
  {
    title: "CO2 emis",
    value: "42.8 kt",
    trend: "12.5%",
    detail: "vs hier",
  },
  {
    title: "Qualite de l'air",
    value: "68",
    trend: "Moderee",
    detail: "Indice AQI",
  },
  {
    title: "Dechets collectes",
    value: "128 t",
    trend: "8.3%",
    detail: "vs hier",
  },
  {
    title: "Taux de recyclage",
    value: "36%",
    trend: "4.7%",
    detail: "vs hier",
  },
];

export const dashboardNavItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Carte interactive", icon: Map },
  { label: "Indicateurs", icon: ChartNoAxesCombined },
  { label: "Historique", icon: Clock3 },
  { label: "Projets", icon: FolderKanban },
  { label: "Chatbot", icon: Bot },
  { label: "Rapports", icon: FileText },
  { label: "Parametres", icon: Settings2 },
];

export const pieSegments = [
  { label: "Industrie", value: "42%", color: "#27D48B" },
  { label: "Transport", value: "28%", color: "#2FA8FF" },
  { label: "Dechets", value: "18%", color: "#F7B03B" },
  { label: "Agriculture", value: "12%", color: "#FF6A3D" },
];

export const featureCards = [
  {
    title: "Dashboard intelligent",
    body: "Suivez la qualite de l'air, les dechets, le CO2 et plus encore en temps reel.",
    icon: ChartNoAxesCombined,
  },
  {
    title: "Chatbot citoyens",
    body: "Posez vos questions, obtenez des conseils personnalises et adoptez les bons eco-gestes.",
    icon: Bot,
  },
  {
    title: "Agent IA avance",
    body: "Analyse intelligente, recommandations et aide a la decision pour vos equipes.",
    icon: Sparkles,
  },
  {
    title: "Espace projets RSE",
    body: "Suivez vos projets et leur impact mesurable en un seul espace.",
    icon: FolderKanban,
  },
];

export const projectCards = [
  {
    title: "Smart Waste Management",
    body: "Optimisation des dechets urbains par IoT et IA",
    tags: ["IoT", "Tri intelligent", "Inclusion sociale", "CO2"],
    icon: Recycle,
    artClass:
      "from-emerald-900 via-emerald-700 to-emerald-500 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.38),transparent_38%)]",
  },
  {
    title: "Capture Ammoniac - Gabes",
    body: "Transformer la pollution en ressource agricole",
    tags: ["NH3 -> Engrais", "Gaussian Plume", "SMS Agriculteurs", "P2P"],
    icon: Factory,
    artClass:
      "from-slate-900 via-slate-700 to-amber-500 before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.28),transparent_36%)]",
  },
];

export const bottomStats = [
  { icon: Leaf, value: "128+", label: "Projets suivis" },
  { icon: Activity, value: "42.8 kt", label: "CO2 evites" },
  { icon: Recycle, value: "36%", label: "Taux de recyclage" },
  { icon: Users, value: "15K+", label: "Utilisateurs engages" },
];
