import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";

import { FormField } from "@/components/FormField";
import { GeneratedImageCard } from "@/components/GeneratedImageCard";
import { PillList } from "@/components/PillList";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenShell } from "@/components/ScreenShell";
import { SectionCard } from "@/components/SectionCard";
import { theme } from "@/constants/theme";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { analyzeWasteImage, sendOrchestratorText } from "@/services/api";
import type { GeneratedImage, OrchestratorResponse, RecyclingResponse, TransparencyAnalyzeResponse } from "@/types";

export default function AssistantScreen() {
  const { apiBaseUrl } = useAppConfig();
  const [text, setText] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<OrchestratorResponse | null>(null);
  const [generatedImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);

  const chooseImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission requise", "Autorisez l'acces a la galerie pour continuer.");
      return;
    }

    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.85
    });

    if (!pickerResult.canceled) {
      setImageUri(pickerResult.assets[0].uri);
      setResult(null);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission requise", "Autorisez l'acces a la camera pour continuer.");
      return;
    }

    const cameraResult = await ImagePicker.launchCameraAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.85
    });

    if (!cameraResult.canceled) {
      setImageUri(cameraResult.assets[0].uri);
      setResult(null);
    }
  };

  const submit = async () => {
    if (!text.trim() && !imageUri) {
      Alert.alert("Entree manquante", "Ajoutez un texte ou une image.");
      return;
    }

    setLoading(true);
    try {
      const nextResult = imageUri
        ? await analyzeWasteImage(imageUri, apiBaseUrl)
        : await sendOrchestratorText(apiBaseUrl, text.trim());
      setResult(nextResult);
    } catch (error) {
      Alert.alert("Requete impossible", error instanceof Error ? error.message : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenShell
      title="Assistant"
      subtitle="Un ecran unique pour dialoguer avec l'orchestrateur du FastAPI. Texte pour les questions, image pour l'analyse des dechets."
    >
      <SectionCard title="Nouvelle requete" subtitle="L'orchestrateur route automatiquement vers transparence ou recyclage.">
        <FormField
          label="Message"
          hint="Exemple: Quelle est la situation de la pollution a Gabes ?"
          value={text}
          onChangeText={setText}
          multiline
        />
        <View style={styles.mediaRow}>
          <PrimaryButton label="Galerie" variant="secondary" onPress={chooseImage} style={styles.flexButton} />
          <PrimaryButton label="Camera" variant="secondary" onPress={takePhoto} style={styles.flexButton} />
        </View>
        <PrimaryButton label="Envoyer a l'assistant" onPress={submit} loading={loading} />
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : null}
      </SectionCard>

      {result?.agent === "transparency" ? <TransparencySummary response={result.response} /> : null}
      {result?.agent === "recycling" ? (
        <RecyclingSummary response={result.response} generatedImages={generatedImages} />
      ) : null}
    </ScreenShell>
  );
}

function TransparencySummary({ response }: { response: TransparencyAnalyzeResponse }) {
  return (
    <SectionCard title="Resultat transparence" subtitle={response.alert_message}>
      <View style={styles.metricsRow}>
        <MetricCard label="AQI" value={String(response.aqi_score)} />
        <MetricCard label="Alerte" value={response.alert_level} />
        <MetricCard label="Signalements" value={String(response.citizen_reports_count)} />
      </View>
      <Text style={styles.subheading}>Anomalies</Text>
      <PillList items={response.anomalies} tone="danger" />
      <Text style={styles.subheading}>Recommandations</Text>
      {response.health_recommendations.map((item) => (
        <Text key={item} style={styles.listText}>- {item}</Text>
      ))}
    </SectionCard>
  );
}

function RecyclingSummary({
  response,
  generatedImages
}: {
  response: RecyclingResponse;
  generatedImages: GeneratedImage[];
}) {
  return (
    <>
      <SectionCard title="Resultat recyclage" subtitle={response.waste_details}>
        <View style={styles.metricsRow}>
          <MetricCard label="Categorie" value={response.waste_category} />
          <MetricCard label="Tri" value={response.disposal_method} />
          <MetricCard label="Reutilisable" value={response.is_reusable ? "Oui" : "Non"} />
        </View>
        <Text style={styles.subheading}>Materiaux</Text>
        <PillList items={response.detected_materials} />
        <Text style={styles.subheading}>Consignes</Text>
        {response.recycling_instructions.map((item) => (
          <Text key={item} style={styles.listText}>- {item}</Text>
        ))}
      </SectionCard>

      {response.upcycling_ideas.length > 0 ? (
        <SectionCard title="Idees detectees" subtitle="L'assistant a aussi renvoye des opportunites d'upcycling.">
          {response.upcycling_ideas.map((idea) => (
            <Text key={idea.id} style={styles.listText}>- {idea.title}</Text>
          ))}
        </SectionCard>
      ) : null}

      {generatedImages.length > 0 ? (
        <SectionCard title="Images generees" subtitle="Si vous venez du flux upcycling, elles apparaissent ici.">
          {generatedImages.map((image) => (
            <GeneratedImageCard key={image.id} image={image} />
          ))}
        </SectionCard>
      ) : null}
    </>
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
  mediaRow: {
    flexDirection: "row",
    gap: theme.spacing.sm
  },
  flexButton: {
    flex: 1
  },
  preview: {
    width: "100%",
    height: 240,
    borderRadius: 20,
    backgroundColor: "#ddd"
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  metricCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 18,
    padding: theme.spacing.md
  },
  metricLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700"
  },
  metricValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800",
    marginTop: 6
  },
  subheading: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "800",
    marginTop: 4
  },
  listText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 21
  }
});
