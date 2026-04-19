import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";

import { theme } from "@/constants/theme";

type Props = TextInputProps & {
  label: string;
  hint?: string;
};

export function FormField({ label, hint, multiline, style, ...props }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <TextInput
        {...props}
        multiline={multiline}
        placeholderTextColor={theme.colors.textMuted}
        style={[styles.input, multiline && styles.multiline, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8
  },
  label: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "800"
  },
  hint: {
    color: theme.colors.textMuted,
    fontSize: 12,
    lineHeight: 18
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: theme.colors.text,
    fontSize: 15
  },
  multiline: {
    minHeight: 110,
    textAlignVertical: "top"
  }
});
