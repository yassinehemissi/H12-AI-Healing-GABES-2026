import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "@/constants/theme";
import { TopNav } from "@/components/TopNav";

type Props = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function ScreenShell({ title, subtitle, children }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#f7f1e8", "#efe4d1", "#dfefd7"]} style={styles.background}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <TopNav />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
          <View style={styles.body}>{children}</View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  background: {
    flex: 1
  },
  content: {
    padding: theme.spacing.lg,
    gap: theme.spacing.lg,
    paddingBottom: 48
  },
  header: {
    gap: theme.spacing.sm
  },
  title: {
    color: theme.colors.text,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900"
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: 15,
    lineHeight: 22
  },
  body: {
    gap: theme.spacing.lg
  }
});
