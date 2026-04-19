import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, View } from "react-native";

import { FormField } from "@/components/FormField";
import { GeneratedImageCard } from "@/components/GeneratedImageCard";
import { IdeaCard } from "@/components/IdeaCard";
import { PillList } from "@/components/PillList";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenShell } from "@/components/ScreenShell";
import { SectionCard } from "@/components/SectionCard";
import { theme } from "@/constants/theme";
import { useAppConfig } from "@/contexts/AppConfigContext";
import {
  analyzeRecyclingImageDirect,
  analyzeRecyclingText,
  fetchRecyclingCategories,
  generateIdeaImages
} from "@/services/api";
import type { GeneratedImage, RecyclingCategoriesResponse, RecyclingIdea, RecyclingResponse } from "@/types";

export default function RecyclingScreen() {
  const { apiBaseUrl } = useAppConfig();
  const [textInput, setTextInput] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [textResult, setTextResult] = useState<RecyclingResponse | null>(null);
  const [imageResult, setImageResult] = useState<RecyclingResponse | null>(null);
  const [categories, setCategories] = useState<RecyclingCategoriesResponse["categories"]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [loadingText, setLoadingText] = useState(false);
  const [loadingImage, setLoadingImage] = useState(false);
  const [loadingIdeaId, setLoadingIdeaId] = useState<string | null>(null);

  useEffect(() => {
    fetchRecyclingCategories(apiBaseUrl)
      .then((payload) => setCategories(payload.categories))
      .catch(() => setCategories([]));
  }, [apiBaseUrl]);

  const pickImage = async () => {
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
      setImageResult(null);
      setGeneratedImages([]);
      setLoadingIdeaId(null);
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
      setImageResult(null);
      setGeneratedImages([]);
      setLoadingIdeaId(null);
    }
  };

  const submitText = async () => {
    if (!textInput.trim()) {
      Alert.alert("Description manquante", "Ajoutez un texte a analyser.");
      return;
    }
    setLoadingText(true);
    try {
      const response = await analyzeRecyclingText(apiBaseUrl, textInput.trim());
      setTextResult(response);
    } catch (error) {
      Alert.alert("Analyse impossible", error instanceof Error ? error.message : "Erreur inconnue.");
    } finally {
      setLoadingText(false);
    }
  };

  const submitImage = async () => {
    if (!imageUri) {
      Alert.alert("Image manquante", "Choisissez une image.");
      return;
    }
    setLoadingImage(true);
    setGeneratedImages([]);
    setLoadingIdeaId(null);
    try {
      const response = await analyzeRecyclingImageDirect(imageUri, apiBaseUrl);
      setImageResult(response);
    } catch (error) {
      Alert.alert("Analyse impossible", error instanceof Error ? error.message : "Erreur inconnue.");
    } finally {
      setLoadingImage(false);
    }
  };

  const generateImagesForIdea = async (idea: RecyclingIdea) => {
    if (!imageResult?.upcycling_session_id) {
      Alert.alert("Session manquante", "Analysez d'abord une image reutilisable pour obtenir des idees.");
      return;
    }

    setLoadingIdeaId(idea.id);
    try {
      const images = await generateIdeaImages(apiBaseUrl, imageResult.upcycling_session_id, idea);
      setGeneratedImages(images);
    } catch (error) {
      Alert.alert("Generation impossible", error instanceof Error ? error.message : "Erreur inconnue.");
    } finally {
      setLoadingIdeaId(null);
    }
  };

  return (
    <ScreenShell
      title="Recyclage"
      subtitle="Toutes les capacites du module recyclage: texte, image, idees d'upcycling et catalogue des categories de tri."
    >
      <SectionCard title="Analyse texte" subtitle="Decrivez un dechet pour obtenir des consignes de tri.">
        <FormField label="Description" value={textInput} onChangeText={setTextInput} multiline />
        <PrimaryButton label="Analyser le texte" onPress={submitText} loading={loadingText} />
        {textResult ? <RecyclingResultCard response={textResult} /> : null}
      </SectionCard>

      <SectionCard title="Analyse image" subtitle="Chargez une image ou prenez une photo pour obtenir le tri, les materiaux detectes et, si possible, des idees d'upcycling.">
        <View style={styles.mediaRow}>
          <PrimaryButton label="Galerie" variant="secondary" onPress={pickImage} style={styles.flexButton} />
          <PrimaryButton label="Camera" variant="secondary" onPress={takePhoto} style={styles.flexButton} />
        </View>
        <PrimaryButton label="Analyser l'image" onPress={submitImage} loading={loadingImage} />
        {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : null}
        {imageResult ? (
          <>
            <RecyclingResultCard response={imageResult} />

            {imageResult.upcycling_ideas.length > 0 && imageResult.upcycling_session_id ? (
              <SectionCard
                title="Idees d'upcycling"
                subtitle="Choisissez une idee proposee par le backend pour generer 3 visuels du produit imagine."
              >
                {imageResult.upcycling_ideas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    loading={loadingIdeaId === idea.id}
                    onPress={() => generateImagesForIdea(idea)}
                  />
                ))}
              </SectionCard>
            ) : null}

            {imageResult.upcycling_eligible === false ? (
              <SectionCard
                title="Upcycling indisponible"
                subtitle={imageResult.upcycling_block_reason || "Cet objet n'est pas reutilisable pour le pipeline creatif."}
              >
                <Text style={styles.infoText}>
                  L'application a bien effectue l'analyse de recyclage, mais elle n'a pas active le parcours de creation.
                </Text>
              </SectionCard>
            ) : null}

            {generatedImages.length > 0 ? (
              <SectionCard title="3 images generees" subtitle="Voici les trois visuels crees a partir de l'idee choisie.">
                {generatedImages.map((image) => (
                  <GeneratedImageCard key={image.id} image={image} />
                ))}
              </SectionCard>
            ) : null}
          </>
        ) : null}
      </SectionCard>

      <SectionCard title="Categories de tri" subtitle="Reference directe de l'endpoint `/recycling/categories`.">
        <View style={styles.categoryGrid}>
          {categories.map((category) => (
            <View key={category.id} style={styles.categoryCard}>
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={styles.categoryTitle}>{category.label}</Text>
              <Text style={styles.categoryMeta}>{category.bin_color}</Text>
            </View>
          ))}
        </View>
      </SectionCard>
    </ScreenShell>
  );
}

function RecyclingResultCard({ response }: { response: RecyclingResponse }) {
  return (
    <View style={styles.resultBox}>
      <Text style={styles.resultTitle}>{response.waste_category}</Text>
      <Text style={styles.resultText}>{response.waste_details}</Text>

      <View style={styles.metricsRow}>
        <MetricCard label="Etat" value={response.object_condition} />
        <MetricCard label="Reutilisable" value={response.is_reusable ? "Oui" : "Non"} />
        <MetricCard label="Tri" value={response.disposal_method} />
      </View>

      <Text style={styles.resultHeading}>Materiaux detectes</Text>
      <PillList items={response.detected_materials} />

      <Text style={styles.resultHeading}>Parties reutilisables</Text>
      <PillList items={response.reusable_parts} />

      <Text style={styles.resultHeading}>Risques</Text>
      <PillList items={response.safety_flags} tone="danger" />

      <Text style={styles.resultHeading}>Consignes</Text>
      {response.recycling_instructions.map((item) => (
        <Text key={item} style={styles.resultText}>- {item}</Text>
      ))}

      <Text style={styles.resultHeading}>Impact environnemental</Text>
      <Text style={styles.resultText}>{response.environmental_impact}</Text>

      <Text style={styles.resultHeading}>Alternatives durables</Text>
      {response.sustainable_alternatives.map((item) => (
        <Text key={item} style={styles.resultText}>- {item}</Text>
      ))}

      <Text style={styles.resultHeading}>Eco-tip</Text>
      <Text style={styles.resultText}>{response.eco_tip}</Text>
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
    borderRadius: 20
  },
  resultBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 18,
    padding: theme.spacing.md,
    gap: theme.spacing.sm
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  metricCard: {
    flex: 1,
    minWidth: 100,
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
  resultTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  resultHeading: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "800"
  },
  resultText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 21
  },
  infoText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 21
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm
  },
  categoryCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: 8
  },
  categoryEmoji: {
    fontSize: 24
  },
  categoryTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: "800"
  },
  categoryMeta: {
    color: theme.colors.textMuted,
    fontSize: 13
  }
});
