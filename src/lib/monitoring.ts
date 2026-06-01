export interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    in: number;
    out: number;
  };
  uptime: number;
  responseTime: number;
}

export interface ServiceStatus {
  id: string;
  name: string;
  status: "operational" | "degraded" | "down";
  uptime: number;
  lastCheck: Date;
  responseTime: number;
  endpoint?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  level: "info" | "warning" | "error" | "success";
  category: string;
  message: string;
  user?: string;
  details?: string | Record<string, unknown>;
}

export interface Alert {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
  service?: string;
}

export interface UsageStatistics {
  activeUsers: number;
  totalRequests: number;
  apiCalls: number;
  databaseQueries: number;
  cacheHitRate: number;
  errorRate: number;
}

export interface PerformanceMetric {
  timestamp: Date;
  value: number;
}

// Les données de monitoring sont maintenant chargées depuis l'API via TechnicalMonitoring.tsx
// Ce fichier ne contient plus que les types et utilitaires

export function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}j ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export function getStatusColor(
  status: ServiceStatus["status"]
): { bg: string; text: string; border: string } {
  switch (status) {
    case "operational":
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200",
      };
    case "degraded":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        border: "border-yellow-200",
      };
    case "down":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        border: "border-red-200",
      };
  }
}

export function getAlertColor(
  severity: Alert["severity"]
): { bg: string; text: string } {
  switch (severity) {
    case "critical":
      return { bg: "bg-red-100", text: "text-red-800" };
    case "high":
      return { bg: "bg-orange-100", text: "text-orange-800" };
    case "medium":
      return { bg: "bg-yellow-100", text: "text-yellow-800" };
    case "low":
      return { bg: "bg-blue-100", text: "text-blue-800" };
  }
}

export function getLogLevelIcon(level: ActivityLog["level"]) {
  switch (level) {
    case "success":
      return "✓";
    case "info":
      return "ℹ";
    case "warning":
      return "⚠";
    case "error":
      return "✕";
  }
}
