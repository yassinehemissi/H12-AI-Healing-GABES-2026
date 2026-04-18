/**
 * Example prompts for the H12 AI Healing Gabès analytics dashboard.
 * These prompts are relevant to industrial pollution monitoring and RSE
 * (Responsabilité Sociétale des Entreprises) scores for companies in the
 * Gabès region of Tunisia.
 */
export const EXAMPLE_PROMPTS: string[] = [
  "Montre-moi l'évolution des émissions de SO2 par entreprise au cours des 6 derniers mois",
  "Compare les scores RSE globaux des entreprises de la région de Gabès",
  "Quelles entreprises ont les niveaux de pollution aux phosphates les plus élevés ?",
  "Affiche la répartition des scores environnementaux, sociaux et de gouvernance par secteur",
  "Montre la corrélation entre les émissions de CO2 et les scores RSE des entreprises",
  "Quelles sont les tendances de pollution de l'air à Gabès sur la dernière année ?",
  "Compare les performances environnementales de GCT et SIAPE",
];

/**
 * Default color palette for chart series.
 * Colors are chosen for accessibility and visual clarity on both light and dark backgrounds.
 */
export const SAMPLE_CHART_COLORS: string[] = [
  "#2563eb", // blue-600
  "#16a34a", // green-600
  "#dc2626", // red-600
  "#d97706", // amber-600
  "#7c3aed", // violet-600
  "#0891b2", // cyan-600
  "#db2777", // pink-600
  "#65a30d", // lime-600
];

/** Message displayed while the analytics request is in progress. */
export const LOADING_MESSAGE =
  "Analyse en cours… Cela peut prendre quelques secondes.";

/** Title shown in the error state card. */
export const ERROR_TITLE = "Erreur lors de l'analyse";

/** Placeholder message shown before the user submits their first query. */
export const EMPTY_STATE_MESSAGE =
  "Posez une question sur les données de pollution ou les scores RSE des entreprises de Gabès pour générer des visualisations.";
