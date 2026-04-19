import React, { useState } from "react";
import { Alert, StyleSheet, Text } from "react-native";

import { FormField } from "@/components/FormField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ScreenShell } from "@/components/ScreenShell";
import { SectionCard } from "@/components/SectionCard";
import { theme } from "@/constants/theme";
import { useAppConfig } from "@/contexts/AppConfigContext";
import { pingBackend } from "@/services/api";

export default function SettingsScreen() {
  const { apiBaseUrl, setApiBaseUrl, isReady } = useAppConfig();
  const [draftUrl, setDraftUrl] = useState(apiBaseUrl);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("");

  const save = async () => {
    if (!draftUrl.trim()) {
      Alert.alert("URL manquante", "Ajoutez l'adresse du backend.");
      return;
    }

    setSaving(true);
    try {
      await setApiBaseUrl(draftUrl.trim());
      setConnectionStatus("");
      Alert.alert("Configuration enregistree", "Le backend par defaut a ete mis a jour.");
    } catch {
      Alert.alert("Erreur", "Impossible d'enregistrer l'URL.");
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      const response = await pingBackend(draftUrl.trim());
      setConnectionStatus(`Connexion OK: ${response.message || response.status}`);
    } catch (error) {
      setConnectionStatus(error instanceof Error ? error.message : "Connexion impossible.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <ScreenShell
      title="Configuration"
      subtitle="Choisissez l'URL du FastAPI selon votre mode de travail: local reseau, Railway ou autre environnement."
    >
      <SectionCard title="Backend FastAPI" subtitle="Cette URL est utilisee par tous les ecrans de l'application.">
        <FormField
          label="API base URL"
          hint="Exemple local: http://10.103.169.240:8000 ou Railway: https://...up.railway.app"
          value={draftUrl}
          onChangeText={setDraftUrl}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <PrimaryButton label="Enregistrer l'URL" onPress={save} loading={saving} />
        <PrimaryButton label="Tester la connexion" variant="secondary" onPress={testConnection} loading={testing} />
        <Text style={styles.helper}>
          {isReady ? `URL active: ${apiBaseUrl}` : "Chargement de la configuration..."}
        </Text>
        {connectionStatus ? <Text style={styles.status}>{connectionStatus}</Text> : null}
        <Text style={styles.note}>
          Si rien n'arrive au backend, commencez ici. Sur Android, une URL HTTPS Railway est souvent plus simple qu'une URL HTTP locale.
        </Text>
      </SectionCard>

      <SectionCard title="Fonctionnalites exposees" subtitle="Cette app couvre maintenant toute la surface fonctionnelle du backend.">
        <Text style={styles.line}>- `/orchestrator/chat`</Text>
        <Text style={styles.line}>- `/recycling/identify-text`</Text>
        <Text style={styles.line}>- `/recycling/identify-image`</Text>
        <Text style={styles.line}>- `/recycling/categories`</Text>
        <Text style={styles.line}>- `/transparency/analyze`</Text>
        <Text style={styles.line}>- `/transparency/report`</Text>
        <Text style={styles.line}>- `/transparency/dashboard/{location}`</Text>
        <Text style={styles.line}>- `/upcycling/suggest-ideas`</Text>
        <Text style={styles.line}>- `/upcycling/generate-images`</Text>
      </SectionCard>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  helper: {
    color: theme.colors.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700"
  },
  line: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 22
  },
  status: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 20
  },
  note: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 20
  }
});
