const grants = {
  daf: ["Paiements"],
  comptable: ["Paiements"],
  directeur_ceo: ["Paiements"],
};

let totalUpdated = 0;

for (const [slug, labels] of Object.entries(grants)) {
  const result = db.roles.updateOne(
    { slug: slug, tenantId: "69ca41f139c12b72252a7e49" },
    { $addToSet: { permissions: { $each: labels } } }
  );
  print(slug + ": matched=" + result.matchedCount + " modified=" + result.modifiedCount);
  totalUpdated += result.modifiedCount;
}

print("---");
print("Total roles updated: " + totalUpdated);
