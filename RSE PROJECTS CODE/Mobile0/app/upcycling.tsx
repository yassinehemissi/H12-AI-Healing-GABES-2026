import React, { useState } from "react";
import { Alert } from "react-native";

import { FormField } from "@/components/FormField";
import { GeneratedImageCard } from "@/components/GeneratedImageCard";
import { IdeaCard } from "@/components/IdeaCard";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenShell } from "@/components/ScreenShell";
import { SectionCard } from "@/components/SectionCard";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { generateIdeaImages, suggestIdeasFromMaterials } from "@/services/api";
import type { GeneratedImage, RecyclingIdea } from "@/types";

export default function UpcyclingScreen() {
  const { apiBaseUrl } = useAppConfig();
  const [materials, setMaterials] = useState("");
  const [preferences, setPreferences] = useState("");
  const [language, setLanguage] = useState<"fr" | "en" | "ar">("fr");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<RecyclingIdea[]>([]);
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(false);
  const [loadingIdeaId, setLoadingIdeaId] = useState<string | null>(null);

  const generateIdeas = async () => {
    if (materials.trim().length < 10) {
      Alert.alert("Materiaux insuffisants", "Ajoutez une description un peu plus detaillee.");
      return;
    }
    setLoadingIdeas(true);
    setImages([]);
    try {
      const response = await suggestIdeasFromMaterials(apiBaseUrl, materials.trim(), preferences.trim(), language);
      setIdeas(response.ideas);
      setSessionId(response.session_id);
    } catch (error) {
      Alert.alert("Ideation impossible", error instanceof Error ? error.message : "Erreur inconnue.");
    } finally {
      setLoadingIdeas(false);
    }
  };

  const generateImagesForIdea = async (idea: RecyclingIdea) => {
    if (!sessionId) {
      Alert.alert("Session manquante", "Generez d'abord des idees.");
      return;
    }
    setLoadingIdeaId(idea.id);
    try {
      const nextImages = await generateIdeaImages(apiBaseUrl, sessionId, idea);
      setImages(nextImages);
    } catch (error) {
      Alert.alert("Generation impossible", error instanceof Error ? error.message : "Erreur inconnue.");
    } finally {
      setLoadingIdeaId(null);
    }
  };

  return (
    <ScreenShell
      title="Upcycling"
      subtitle="Version mobile complete des endpoints `/upcycling/suggest-ideas` et `/upcycling/generate-images`."
    >
      <SectionCard title="Matiere premiere" subtitle="Donnez les materiaux disponibles pour obtenir des idees de produits.">
        <FormField label="Materiaux" value={materials} onChangeText={setMaterials} multiline />
        <FormField label="Preferences" value={preferences} onChangeText={setPreferences} multiline />
        <FormField label="Langue" hint="fr, en ou ar" value={language} onChangeText={(value) => setLanguage((value || "fr") as "fr" | "en" | "ar")} />
        <PrimaryButton label="Generer les idees" onPress={generateIdeas} loading={loadingIdeas} />
      </SectionCard>

      {ideas.length > 0 ? (
        <SectionCard title="Idees proposees" subtitle="Choisissez une idee pour lancer la generation des 3 visuels.">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              loading={loadingIdeaId === idea.id}
              onPress={() => generateImagesForIdea(idea)}
            />
          ))}
        </SectionCard>
      ) : null}

      {images.length > 0 ? (
        <SectionCard title="Visuels generes" subtitle="Les images sont servies directement par le backend FastAPI.">
          {images.map((image) => (
            <GeneratedImageCard key={image.id} image={image} />
          ))}
        </SectionCard>
      ) : null}
    </ScreenShell>
  );
}
