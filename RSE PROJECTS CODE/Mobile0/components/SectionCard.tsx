import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function SectionCard({ title, subtitle, children }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colors.text
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.textMuted
  },
  content: {
    gap: theme.spacing.sm
  }
});
