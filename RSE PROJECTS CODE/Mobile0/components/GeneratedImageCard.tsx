import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import React, { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/constants/theme";
import type { GeneratedImage } from "@/types";

type Props = {
  image: GeneratedImage;
};

export function GeneratedImageCard({ image }: Props) {
  const [saving, setSaving] = useState(false);

  const saveImage = async () => {
    if (!FileSystem.cacheDirectory) {
      Alert.alert("Sauvegarde impossible", "Le dossier temporaire de l'app est indisponible.");
      return;
    }

    setSaving(true);
    try {
      // We explicitly request media-library access because generated images should be saved directly to the phone gallery.
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission requise", "Autorisez l'acces a la galerie pour enregistrer l'image.");
        return;
      }

      const extension = image.url.split(".").pop()?.split("?")[0] || "png";
      const targetPath = `${FileSystem.cacheDirectory}${image.id}.${extension}`;
      const download = await FileSystem.downloadAsync(image.url, targetPath);
      await MediaLibrary.createAssetAsync(download.uri);
      Alert.alert("Image enregistree", "L'image a ete ajoutee a votre galerie.");
    } catch (error) {
      Alert.alert("Sauvegarde impossible", error instanceof Error ? error.message : "Erreur inconnue.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: image.url }} style={styles.image} resizeMode="cover" />
      <Text style={styles.title}>{image.variant_name}</Text>
      <Text style={styles.link}>{image.url}</Text>
      <Pressable style={[styles.button, saving && styles.buttonDisabled]} onPress={saveImage} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? "Enregistrement..." : "Telecharger l'image"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden"
  },
  image: {
    width: "100%",
    height: 220,
    backgroundColor: "#ddd"
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: "800",
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md
  },
  link: {
    color: theme.colors.textMuted,
    fontSize: 12,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.button,
    paddingVertical: 14,
    alignItems: "center",
    margin: theme.spacing.md
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
