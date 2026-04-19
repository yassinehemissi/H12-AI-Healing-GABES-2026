import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";
import type { RecyclingIdea } from "@/types";

type Props = {
  idea: RecyclingIdea;
  onPress: () => void;
  loading?: boolean;
};

export function IdeaCard({ idea, onPress, loading = false }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{idea.title}</Text>
      <Text style={styles.description}>{idea.description}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{idea.difficulty}</Text>
        <Text style={styles.meta}>{idea.estimated_time}</Text>
        <Text style={styles.meta}>{idea.category}</Text>
      </View>
      <Text style={styles.materials}>Materiaux: {idea.materials_used.join(", ")}</Text>
      <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={onPress} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Generation..." : "Generer 3 images"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff7ed",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#f0d3b0",
    padding: theme.spacing.md,
    gap: theme.spacing.sm
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  description: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs
  },
  meta: {
    backgroundColor: "#fde7c7",
    color: "#9a5b04",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    overflow: "hidden",
    fontSize: 12,
    fontWeight: "700"
  },
  materials: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18
  },
  button: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.radius.button,
    paddingVertical: 14,
    alignItems: "center"
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 15
  }
});
