import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppConfigProvider } from "@/contexts/AppConfigContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AppConfigProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="assistant" />
          <Stack.Screen name="recycling" />
          <Stack.Screen name="transparency" />
          <Stack.Screen name="upcycling" />
          <Stack.Screen name="settings" />
        </Stack>
      </AppConfigProvider>
    </SafeAreaProvider>
  );
}
