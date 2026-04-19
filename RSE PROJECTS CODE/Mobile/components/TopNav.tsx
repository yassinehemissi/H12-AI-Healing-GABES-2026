import { usePathname, useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text } from "react-native";

import { theme } from "@/constants/theme";

const links = [
  { route: "/", label: "Accueil" },
  { route: "/assistant", label: "Assistant" },
  { route: "/recycling", label: "Recyclage" },
  { route: "/transparency", label: "Transparence" },
  { route: "/upcycling", label: "Upcycling" },
  { route: "/settings", label: "Config" }
] as const;

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {links.map((link) => {
        const active = pathname === link.route;
        return (
          <Pressable
            key={link.route}
            style={[styles.item, active && styles.activeItem]}
            onPress={() => router.push(link.route as any)}
          >
            <Text style={[styles.label, active && styles.activeLabel]}>{link.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    paddingVertical: 2
  },
  item: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "rgba(255,255,255,0.66)",
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: "rgba(214,199,177,0.9)"
  },
  activeItem: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary
  },
  label: {
    color: theme.colors.text,
    fontWeight: "700",
    fontSize: 13
  },
  activeLabel: {
    color: "#fff"
  }
});
