import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { FeatureLinkCard } from "@/components/FeatureLinkCard";
import { ScreenShell } from "@/components/ScreenShell";
import { SectionCard } from "@/components/SectionCard";
import { theme } from "@/constants/theme";
import { useAppConfig } from "@/contexts/AppConfigContext";

export default function HomeScreen() {
  const { apiBaseUrl } = useAppConfig();

  return (
    <ScreenShell
      title="Gabes Eco Mobile"
      subtitle="Une interface mobile complete pour toutes les fonctionnalites du FastAPI: assistant, recyclage, transparence, upcycling et configuration."
    >
      <SectionCard
        title="Backend connecte"
        subtitle="L'application utilise la meme base FastAPI pour toutes les experiences."
      >
        <Text style={styles.baseUrl}>{apiBaseUrl}</Text>
      </SectionCard>

      <View style={styles.grid}>
        <FeatureLinkCard
          route="/assistant"
          badge="AI"
          title="Assistant"
          description="Point d'entree unifie texte ou image avec routage automatique."
        />
        <FeatureLinkCard
          route="/recycling"
          badge="TRI"
          title="Recyclage"
          description="Analyse texte, analyse image et categories de tri."
        />
        <FeatureLinkCard
          route="/transparency"
          badge="AIR"
          title="Transparence"
          description="Analyse pollution, dashboard de zone et signalement citoyen."
        />
        <FeatureLinkCard
          route="/upcycling"
          badge="LAB"
          title="Upcycling"
          description="Idees a partir de materiaux et generation de visuels."
        />
      </View>

      <SectionCard title="Parcours recommande" subtitle="Commencez par l'ecran Assistant pour une experience la plus naturelle.">
        <Text style={styles.step}>1. Prenez une photo ou posez une question.</Text>
        <Text style={styles.step}>2. Consultez les recommandations ou idees generees.</Text>
        <Text style={styles.step}>3. Ouvrez les ecrans specialises pour aller plus loin.</Text>
      </SectionCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
    justifyContent: "space-between"
  },
  baseUrl: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: "800"
  },
  step: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 22
  }
});
