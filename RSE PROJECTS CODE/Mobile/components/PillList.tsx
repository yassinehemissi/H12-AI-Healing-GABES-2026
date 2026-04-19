import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";

type Props = {
  items: string[];
  tone?: "default" | "danger";
};

export function PillList({ items, tone = "default" }: Props) {
  if (!items.length) {
    return <Text style={styles.empty}>Aucun element.</Text>;
  }

  return (
    <View style={styles.wrap}>
      {items.map((item) => (
        <View
          key={`${tone}-${item}`}
          style={[
            styles.pill,
            tone === "danger" ? styles.pillDanger : styles.pillDefault
          ]}
        >
          <Text
            style={[
              styles.label,
              tone === "danger" ? styles.labelDanger : styles.labelDefault
            ]}
          >
            {item}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.xs
  },
  pill: {
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1
  },
  pillDefault: {
    backgroundColor: "#e2f3ef",
    borderColor: "#b9ddd4"
  },
  pillDanger: {
    backgroundColor: "#fde7db",
    borderColor: "#f7c8b1"
  },
  label: {
    fontSize: 13,
    fontWeight: "700"
  },
  labelDefault: {
    color: theme.colors.primary
  },
  labelDanger: {
    color: theme.colors.danger
  },
  empty: {
    color: theme.colors.textMuted,
    fontSize: 14
  }
});
