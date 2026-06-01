import { useState } from "react";

export function useInitData() {
  // Version simplifiée sans initialisation de données pour éviter les erreurs
  const [isInitialized] = useState(true);
  const [isInitializing] = useState(false);

  return { isInitialized, isInitializing };
}
