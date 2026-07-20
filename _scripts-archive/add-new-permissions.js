const grants = {
  super_admin: ["CV Tech", "Intervenants", "Notifications", "Alertes"],
  admin_plateforme: ["Notifications", "Alertes"],
  directeur_ceo: ["Notifications", "Alertes"],
  daf: ["Notifications", "Alertes"],
  comptable: ["Notifications", "Alertes"],
  comptable_externe: [],
  responsable_rh: ["CV Tech", "Intervenants", "Notifications", "Alertes"],
  responsable_commercial: ["Notifications", "Alertes"],
  chef_projet: ["CV Tech", "Intervenants", "Notifications", "Alertes"],
  commercial: ["Notifications"],
  salarie_consultant: ["Notifications"],
  intervenant_externe: [],
  client_role: [],
  fournisseur: [],
};

let totalUpdated = 0;

for (const [slug, labels] of Object.entries(grants)) {
  if (labels.length === 0) continue;
  const result = db.roles.updateOne(
    { slug: slug, tenantId: "69ca41f139c12b72252a7e49" },
    { $addToSet: { permissions: { $each: labels } } }
  );
  print(slug + ": matched=" + result.matchedCount + " modified=" + result.modifiedCount);
  totalUpdated += result.modifiedCount;
}

print("---");
print("Total roles updated: " + totalUpdated);
