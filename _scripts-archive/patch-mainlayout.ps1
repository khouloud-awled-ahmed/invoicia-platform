$path = ".\src\components\MainLayout.tsx"
$content = Get-Content $path -Raw -Encoding UTF8

$old1 = @'
  const hasPermission = (pageId: string): boolean => {
    if (user?.role === "TENANT_ADMIN") return true;
    // While permissions are still loading, hide everything except the always-visible socle
    // to avoid a flash of full access before the real permissions arrive.
    if (!permissionsLoaded) return SOCLE_IDS.has(pageId);

    const pageToModule: Record<string, string> = {
      dashboard: "dashboard", sales: "sales", "credit-notes": "sales",
      expenses: "purchases", suppliers: "purchases", accounting: "accounting",
      banking: "banking", hr: "hr", projects: "projects", clients: "clients",
      ged: "ged", signature: "signature", pipeline: "crm", autoinvoicing: "sales",
      users: "users", settings: "settings", notifications: "dashboard",
      alerts: "dashboard", monitoring: "settings", cvtech: "hr",
      payments: "accounting", intervenants: "hr",
    };
    const module = pageToModule[pageId];
    if (!module) return true;
    const perm = userPermissions.find((p: any) => p.module === module);
    return perm?.actions?.view === true;
  };
'@

$new1 = @'
  const pageToPermissionLabels: Record<string, string[]> = {
    dashboard: ["Tableau de bord"],
    sales: ["Ventes & Factures"],
    "credit-notes": ["Ventes & Factures"],
    autoinvoicing: ["Ventes & Factures"],
    expenses: ["Achats & Fournisseurs"],
    suppliers: ["Achats & Fournisseurs"],
    accounting: ["Comptabilite"],
    banking: ["Banque"],
    hr: ["RH & Absences"],
    intervenants: ["RH & Absences"],
    cvtech: ["RH & Absences"],
    projects: ["Projets"],
    clients: ["Clients"],
    ged: ["GED (Documents)"],
    signature: ["Signature electronique"],
    pipeline: ["CRM (Pipeline)"],
    users: ["Utilisateurs & Roles"],
    settings: ["Parametres"],
    "bi-dashboard": ["Reporting & Analytics"],
    notifications: ["Tableau de bord"],
    alerts: ["Tableau de bord"],
    monitoring: ["Parametres"],
    payments: ["Comptabilite"],
  };

  const hasPermission = (pageId: string): boolean => {
    if (user?.role === "TENANT_ADMIN") return true;
    if (!permissionsLoaded) return SOCLE_IDS.has(pageId);
    const requiredLabels = pageToPermissionLabels[pageId];
    if (!requiredLabels) return true;
    return requiredLabels.some((label) => userPermissions.includes(label));
  };
'@

if ($content.Contains($old1)) {
    $content = $content.Replace($old1, $new1)
    Write-Host "Replacement 1 applied successfully" -ForegroundColor Green
} else {
    Write-Host "WARNING: old1 block not found - no change made" -ForegroundColor Yellow
}

$old2 = 'const SOCLE_IDS = new Set(["dashboard", "settings", "users"]);'
$new2 = 'const SOCLE_IDS = new Set(["dashboard"]);'
if ($content.Contains($old2)) {
    $content = $content.Replace($old2, $new2)
    Write-Host "Replacement 2 applied successfully" -ForegroundColor Green
} else {
    Write-Host "WARNING: old2 block not found - maybe already patched" -ForegroundColor Yellow
}

Set-Content -Path $path -Value $content -NoNewline -Encoding UTF8
Write-Host "Saved: $path" -ForegroundColor Cyan
