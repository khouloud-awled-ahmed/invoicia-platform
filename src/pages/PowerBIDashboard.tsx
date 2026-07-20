import React, { useState } from "react";

const POWERBI_EMBED_URL =
  "https://app.powerbi.com/view?r=eyJrIjoiMWZlNDViMTQtNGUzMy00Mzk5LTgyOTUtYjE5OTFhZDQ5NjIzIiwidCI6IjdhZjM4YmQ0LWRhMDktNGNhZC1iODcwLTA2MTdhMmRmNTRkNCIsImMiOjl9&navContentPaneEnabled=false&filterPaneEnabled=false";

const PowerBIDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="flex flex-col h-full w-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Dashboard Plateforme</h1>
          <p className="text-sm text-gray-500">Vue d ensemble de la plateforme SaaS</p>
        </div>
        <button
          onClick={() => {
            setIsLoading(true);
            const iframe = document.getElementById("powerbi-iframe") as HTMLIFrameElement;
            if (iframe) {
              iframe.src = iframe.src;
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Actualiser
        </button>
      </div>

      {/* Dashboard container */}
      <div className="flex-1 relative p-4">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 font-medium">Chargement du dashboard...</p>
            </div>
          </div>
        )}

        {/* Wrapper that clips the bottom Power BI bar */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "calc(100vh - 180px)",
            overflow: "hidden",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            border: "1px solid #e5e7eb",
            backgroundColor: "#fff",
          }}
        >
          <iframe
            id="powerbi-iframe"
            title="nvoicia Cockpit"
            src={POWERBI_EMBED_URL}
            frameBorder="0"
            allowFullScreen
            style={{
              width: "100%",
              height: "calc(100% + 50px)", // extra height to push bottom bar out of view
              border: "none",
            }}
            onLoad={() => setIsLoading(false)}
          />
          {/* Overlay to cover Power BI bottom bar */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "50px",
              backgroundColor: "#ffffff",
              zIndex: 10,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PowerBIDashboard;
