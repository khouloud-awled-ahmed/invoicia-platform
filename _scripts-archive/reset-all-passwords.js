const emails = [
  "daf.t0@techcorp.tn",
  "commercial.resp.t0@techcorp.tn",
  "chefprojet.t0@techcorp.tn",
  "commercial.t0@techcorp.tn",
  "comptable.ext.t0@techcorp.tn",
  "consultant.t0@techcorp.tn",
  "intervenant.t0@techcorp.tn",
  "client.t0@techcorp.tn",
  "fournisseur.t0@techcorp.tn"
];

const hash = "$2b$10$V1jRyX9n5zbiE9lFq4SXse2n7W7RnlWhlde1H/E.wdzGC4FbU19Jm";

for (const email of emails) {
  const result = db.users.updateOne({ email: email }, { $set: { password: hash } });
  print(email + ": matched=" + result.matchedCount + " modified=" + result.modifiedCount);
}
