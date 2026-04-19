import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from "react-native";

import { theme } from "@/constants/theme";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function PrimaryButton({
  label,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  style
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      style={[
        styles.base,
        variant === "primary" ? styles.primary : styles.secondary,
        isDisabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : theme.colors.primary} />
      ) : (
        <Text style={[styles.label, variant === "primary" ? styles.primaryLabel : styles.secondaryLabel]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50,
    borderRadius: theme.radius.button,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  primary: {
    backgroundColor: theme.colors.primary
  },
  secondary: {
    backgroundColor: theme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  disabled: {
    opacity: 0.65
  },
  label: {
    fontSize: 15,
    fontWeight: "800"
  },
  primaryLabel: {
    color: "#fff"
  },
  secondaryLabel: {
    color: theme.colors.text
  }
});
