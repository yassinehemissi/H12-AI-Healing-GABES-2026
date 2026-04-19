import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";

type Props = {
  route: "/assistant" | "/recycling" | "/transparency" | "/upcycling" | "/settings";
  badge: string;
  title: string;
  description: string;
};

export function FeatureLinkCard({ route, badge, title, description }: Props) {
  const router = useRouter();

  return (
    <Pressable style={styles.card} onPress={() => router.push(route as any)}>
      <View style={styles.iconWrap}>
        <Text style={styles.icon}>{badge}</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.card,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: theme.spacing.sm,
    minHeight: 170,
    width: "48%"
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e4f2ee"
  },
  icon: {
    fontSize: 15,
    fontWeight: "900",
    color: theme.colors.primary
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: "800"
  },
  description: {
    color: theme.colors.textMuted,
    fontSize: 14,
    lineHeight: 20
  }
});
