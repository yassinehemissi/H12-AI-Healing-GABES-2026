import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

import { getDefaultApiBaseUrl } from "@/services/api";

type AppConfigContextValue = {
  apiBaseUrl: string;
  setApiBaseUrl: (value: string) => Promise<void>;
  isReady: boolean;
};

const storageKey = "gabes_eco_api_base_url";

const AppConfigContext = createContext<AppConfigContextValue | undefined>(undefined);

export function AppConfigProvider({ children }: { children: React.ReactNode }) {
  const [apiBaseUrl, setApiBaseUrlState] = useState(getDefaultApiBaseUrl());
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then((storedValue) => {
        if (storedValue) {
          setApiBaseUrlState(storedValue);
        }
      })
      .finally(() => setIsReady(true));
  }, []);

  const setApiBaseUrl = async (value: string) => {
    setApiBaseUrlState(value);
    await AsyncStorage.setItem(storageKey, value);
  };

  const value = useMemo(
    () => ({
      apiBaseUrl,
      setApiBaseUrl,
      isReady
    }),
    [apiBaseUrl, isReady]
  );

  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>;
}

export function useAppConfig() {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error("useAppConfig must be used within AppConfigProvider");
  }
  return context;
}
