import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

import { FormField } from "@/components/FormField";
import { PillList } from "@/components/PillList";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenShell } from "@/components/ScreenShell";
import { SectionCard } from "@/components/SectionCard";
import { theme } from "@/constants/theme";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { analyzeTransparency, fetchTransparencyDashboard, submitTransparencyReport } from "@/services/api";
import type {
  TransparencyAnalyzeResponse,
  TransparencyDashboardResponse,
  TransparencyReportResponse
} from "@/types";

export default function TransparencyScreen() {
  const { apiBaseUrl } = useAppConfig();
  const [location, setLocation] = useState("Gabes");
  const [date, setDate] = useState("");
  const [ageGroup, setAgeGroup] = useState("adulte");
  const [vulnerabilities, setVulnerabilities] = useState("");
  const [analysis, setAnalysis] = useState<TransparencyAnalyzeResponse | null>(null);
  const [dashboard, setDashboard] = useState<TransparencyDashboardResponse | null>(null);
  const [reportResponse, setReportResponse] = useState<TransparencyReportResponse | null>(null);
  const [reportType, setReportType] = useState("odeur");
  const [reportDescription, setReportDescription] = useState("");
  const [reportSeverity, setReportSeverity] = useState("moyenne");
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  const runAnalysis = async () => {
    if (!location.trim()) {
      Alert.alert("Localisation manquante", "Ajoutez une zone a analyser.");
      return;
    }
    setLoadingAnalysis(true);
    try {
      const response = await analyzeTransparency(apiBaseUrl, {
        location: location.trim(),
        date: date.trim() || null,
        user_profile: {
          age_group: ageGroup.trim() || "adulte",
          vulnerabilities: vulnerabilities
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        }
      });
      setAnalysis(response);
    } catch (error) {
      Alert.alert("Analyse impossible", error instanceof Error ? error.message : "Erreur inconnue.");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const loadDashboard = async () => {
    if (!location.trim()) {
      Alert.alert("Localisation manquante", "Ajoutez une zone pour charger le dashboard.");
      return;
    }
    setLoadingDashboard(true);
    try {
      const response = await fetchTransparencyDashboard(apiBaseUrl, location.trim());
      setDashboard(response);
    } catch (error) {
      Alert.alert("Dashboard indisponible", error instanceof Error ? error.message : "Erreur inconnue.");
    } finally {
      setLoadingDashboard(false);
    }
  };

  const submitReport = async () => {
    if (!location.trim() || !reportDescription.trim()) {
      Alert.alert("Signalement incomplet", "La localisation et la description sont requises.");
      return;
    }
    setLoadingReport(true);
    try {
      const response = await submitTransparencyReport(apiBaseUrl, {
        location: location.trim(),
        type: reportType.trim(),
        description: reportDescription.trim(),
        severity: reportSeverity.trim()
      });
      setReportResponse(response);
    } catch (error) {
      Alert.alert("Envoi impossible", error instanceof Error ? error.message : "Erreur inconnue.");
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <ScreenShell
      title="Transparence"
      subtitle="Analyse de pollution, dashboard local et signalement citoyen dans une seule interface mobile."
    >
      <SectionCard title="Analyse de pollution" subtitle="Equivalent mobile de `/transparency/analyze`.">
        <FormField label="Localisation" value={location} onChangeText={setLocation} />
        <FormField label="Date optionnelle" hint="Exemple: 2026-04-19" value={date} onChangeText={setDate} />
        <FormField label="Groupe d'age" value={ageGroup} onChangeText={setAgeGroup} />
        <FormField
          label="Vulnerabilites"
          hint="Separez par des virgules, ex: asthme, grossesse"
          value={vulnerabilities}
          onChangeText={setVulnerabilities}
        />
        <PrimaryButton label="Lancer l'analyse" onPress={runAnalysis} loading={loadingAnalysis} />
        {analysis ? <TransparencyAnalysisCard response={analysis} /> : null}
      </SectionCard>

      <SectionCard title="Dashboard zone" subtitle="Equivalent mobile de `/transparency/dashboard/{location}`.">
        <PrimaryButton label="Charger le dashboard" variant="secondary" onPress={loadDashboard} loading={loadingDashboard} />
        {dashboard ? <TransparencyDashboardCard response={dashboard} /> : null}
      </SectionCard>

      <SectionCard title="Signalement citoyen" subtitle="Equivalent mobile de `/transparency/report`.">
        <FormField label="Type" value={reportType} onChangeText={setReportType} />
        <FormField label="Gravite" value={reportSeverity} onChangeText={setReportSeverity} />
        <FormField label="Description" value={reportDescription} onChangeText={setReportDescription} multiline />
        <PrimaryButton label="Envoyer le signalement" onPress={submitReport} loading={loadingReport} />
        {reportResponse ? (
          <View style={styles.responseBox}>
            <Text style={styles.responseTitle}>{reportResponse.report_id}</Text>
            <Text style={styles.responseText}>{reportResponse.message}</Text>
          </View>
        ) : null}
      </SectionCard>
    </ScreenShell>
  );
}

function TransparencyAnalysisCard({ response }: { response: TransparencyAnalyzeResponse }) {
  return (
    <View style={styles.responseBox}>
      <Text style={styles.responseTitle}>{response.alert_level}</Text>
      <Text style={styles.responseText}>{response.alert_message}</Text>
      <View style={styles.metricsRow}>
        <MetricCard label="AQI" value={String(response.aqi_score)} />
        <MetricCard label="Zone" value={response.location} />
        <MetricCard label="Rapports" value={String(response.citizen_reports_count)} />
      </View>
      <Text style={styles.sectionTitle}>Anomalies</Text>
      <PillList items={response.anomalies} tone="danger" />
      <Text style={styles.sectionTitle}>Recommandations</Text>
      {response.health_recommendations.map((item) => (
        <Text key={item} style={styles.responseText}>- {item}</Text>
      ))}
    </View>
  );
}

function TransparencyDashboardCard({ response }: { response: TransparencyDashboardResponse }) {
  return (
    <View style={styles.responseBox}>
      <View style={styles.metricsRow}>
        <MetricCard label="Zone" value={response.location} />
        <MetricCard label="Tendance" value={response.trend_7days} />
        <MetricCard label="Signalements" value={String(response.total_citizen_reports)} />
      </View>
      <Text style={styles.responseText}>Alerte actuelle: {response.current_alert_level}</Text>
      <Text style={styles.responseText}>Mise a jour: {response.last_updated}</Text>
      <Text style={styles.responseText}>Points recents: {response.recent_data.length}</Text>
    </View>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  responseBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 18,
    padding: theme.spacing.md,
    gap: theme.spacing.sm
  },
  responseTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  responseText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 21
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  metricCard: {
    flex: 1,
    minWidth: 95,
    backgroundColor: "#f8f5ef",
    borderRadius: 16,
    padding: theme.spacing.sm
  },
  metricLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700"
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "800"
  }
});
