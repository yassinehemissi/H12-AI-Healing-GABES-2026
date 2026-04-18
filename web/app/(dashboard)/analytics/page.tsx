import type { Metadata } from "next";
import { AnalyticsOverviewPage } from "./(components)/analytics-overview-page";

export const metadata: Metadata = {
  title: "Analytics Dashboard | H12 AI Healing",
};

export default function AnalyticsPage() {
  return <AnalyticsOverviewPage />;
}
