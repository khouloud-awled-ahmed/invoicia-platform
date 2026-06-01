// IMPORT CRITIQUE : Configuration PDF Worker DOIT être chargée en premier
import "./lib/pdf-worker-config";

import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  const root = createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
} catch (error) {
  console.error("Error rendering app:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Erreur de chargement</h1>
      <p>Une erreur s'est produite lors du chargement de l'application.</p>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 4px; overflow: auto; margin-top: 10px;">
        ${error instanceof Error ? error.message : String(error)}
        ${error instanceof Error && error.stack ? `\n\n${error.stack}` : ''}
      </pre>
      <button 
        onclick="window.location.reload()" 
        style="margin-top: 20px; padding: 10px 20px; cursor: pointer; background: #007bff; color: white; border: none; border-radius: 4px;">
        Recharger la page
      </button>
    </div>
  `;
}
