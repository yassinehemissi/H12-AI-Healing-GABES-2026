import Constants from "expo-constants";

import type {
  GeneratedImage,
  ManualIdeasResponse,
  OrchestratorResponse,
  RecyclingCategoriesResponse,
  RecyclingIdea,
  RecyclingResponse,
  TransparencyAnalyzeRequest,
  TransparencyAnalyzeResponse,
  TransparencyDashboardResponse,
  TransparencyReportRequest,
  TransparencyReportResponse
} from "@/types";

const fallbackBaseUrl = "http://10.103.169.240:8000";

export const getDefaultApiBaseUrl = () => {
  const fromExpo = Constants.expoConfig?.extra?.apiBaseUrl;
  if (typeof fromExpo === "string" && fromExpo.trim()) {
    return fromExpo.trim().replace(/\/$/, "");
  }
  return fallbackBaseUrl;
};

const normalizeBaseUrl = (baseUrl: string) => baseUrl.trim().replace(/\/$/, "");

const buildUrl = (baseUrl: string, path: string) => `${normalizeBaseUrl(baseUrl)}${path}`;

const describeNetworkError = (baseUrl: string, error: unknown) => {
  const detail = error instanceof Error ? error.message : "Erreur reseau inconnue.";
  return `Connexion impossible vers ${normalizeBaseUrl(baseUrl)}. Verifiez l'URL active, que FastAPI tourne avec uvicorn main:app --host 0.0.0.0 --port 8000, que le telephone est sur le meme reseau Wi-Fi et que le pare-feu Windows autorise le port 8000. Sur Android, une URL HTTPS est parfois plus fiable que HTTP. Detail: ${detail}`;
};

const safeFetch = async (baseUrl: string, path: string, options?: RequestInit) => {
  try {
    return await fetch(buildUrl(baseUrl, path), options);
  } catch (error) {
    throw new Error(describeNetworkError(baseUrl, error));
  }
};

export const pingBackend = async (baseUrl: string): Promise<{ status: string; message?: string }> => {
  const response = await safeFetch(baseUrl, "/");
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || "Le backend a repondu avec une erreur.");
  }
  return payload as { status: string; message?: string };
};

export const analyzeWasteImage = async (imageUri: string, baseUrl: string): Promise<OrchestratorResponse> => {
  const formData = new FormData();
  formData.append(
    "file",
    {
      uri: imageUri,
      name: "waste.jpg",
      type: "image/jpeg"
    } as any
  );

  const response = await safeFetch(baseUrl, "/orchestrator/chat", {
    method: "POST",
    body: formData
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || "Waste analysis failed.");
  }
  return payload as OrchestratorResponse;
};

export const analyzeRecyclingImageDirect = async (imageUri: string, baseUrl: string): Promise<RecyclingResponse> => {
  const formData = new FormData();
  formData.append(
    "file",
    {
      uri: imageUri,
      name: "waste.jpg",
      type: "image/jpeg"
    } as any
  );

  const response = await safeFetch(baseUrl, "/recycling/identify-image", {
    method: "POST",
    body: formData
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || "Recycling image analysis failed.");
  }
  return payload as RecyclingResponse;
};

export const sendOrchestratorText = async (baseUrl: string, text: string): Promise<OrchestratorResponse> => {
  const formData = new FormData();
  formData.append("text", text);

  const response = await safeFetch(baseUrl, "/orchestrator/chat", {
    method: "POST",
    body: formData
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || "Assistant request failed.");
  }
  return payload as OrchestratorResponse;
};

export const analyzeRecyclingText = async (baseUrl: string, description: string): Promise<RecyclingResponse> => {
  const response = await safeFetch(baseUrl, "/recycling/identify-text", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ description })
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || "Recycling text analysis failed.");
  }
  return payload as RecyclingResponse;
};

export const fetchRecyclingCategories = async (baseUrl: string): Promise<RecyclingCategoriesResponse> => {
  const response = await safeFetch(baseUrl, "/recycling/categories");
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || "Failed to fetch recycling categories.");
  }
  return payload as RecyclingCategoriesResponse;
};

export const analyzeTransparency = async (
  baseUrl: string,
  data: TransparencyAnalyzeRequest
): Promise<TransparencyAnalyzeResponse> => {
  const response = await safeFetch(baseUrl, "/transparency/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || "Transparency analysis failed.");
  }
  return payload as TransparencyAnalyzeResponse;
};

export const submitTransparencyReport = async (
  baseUrl: string,
  data: TransparencyReportRequest
): Promise<TransparencyReportResponse> => {
  const response = await safeFetch(baseUrl, "/transparency/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || "Report submission failed.");
  }
  return payload as TransparencyReportResponse;
};

export const fetchTransparencyDashboard = async (
  baseUrl: string,
  location: string
): Promise<TransparencyDashboardResponse> => {
  const response = await safeFetch(baseUrl, `/transparency/dashboard/${encodeURIComponent(location)}`);
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || "Dashboard fetch failed.");
  }
  return payload as TransparencyDashboardResponse;
};

export const suggestIdeasFromMaterials = async (
  baseUrl: string,
  materials: string,
  preferences: string,
  language: "fr" | "en" | "ar"
): Promise<ManualIdeasResponse> => {
  const response = await safeFetch(baseUrl, "/upcycling/suggest-ideas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      materials,
      preferences,
      language
    })
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || "Idea generation failed.");
  }
  return payload as ManualIdeasResponse;
};

export const generateIdeaImages = async (
  baseUrl: string,
  sessionId: string,
  chosenIdea: RecyclingIdea
): Promise<GeneratedImage[]> => {
  const response = await safeFetch(baseUrl, "/upcycling/generate-images", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      session_id: sessionId,
      chosen_idea: chosenIdea,
      style_preference: "realiste"
    })
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || "Image generation failed.");
  }

  const images = Array.isArray(payload?.images) ? payload.images : [];
  return images.map((item: GeneratedImage) => ({
    ...item,
    url: item.url.startsWith("http") ? item.url : `${normalizeBaseUrl(baseUrl)}${item.url}`
  }));
};
