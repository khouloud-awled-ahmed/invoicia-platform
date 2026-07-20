const tenantId = "69ca41f139c12b72252a7e49";
function daysAgo(n) { return new Date(Date.now() - n * 24 * 60 * 60 * 1000); }

const employees = [
  { firstName: "Mehdi", lastName: "Zribi", email: "mehdi.zribi@test.invocia.tn", position: "Support", department: "IT", salary: 1800, status: "active", tenantId },
  { firstName: "Rania", lastName: "Belhadj", email: "rania.belhadj@test.invocia.tn", position: "Marketing", department: "Marketing", salary: 2000, status: "active", tenantId },
  { firstName: "Yassine", lastName: "Chaabane", email: "yassine.chaabane@test.invocia.tn", position: "Logistique", department: "Ops", salary: 1900, status: "active", tenantId },
  { firstName: "Ines", lastName: "Ouertani", email: "ines.ouertani@test.invocia.tn", position: "Designer", department: "Produit", salary: 2100, status: "active", tenantId },
  { firstName: "Bilel", lastName: "Sassi", email: "bilel.sassi@test.invocia.tn", position: "QA", department: "IT", salary: 1950, status: "active", tenantId },
];

const inserted = employees.map((e) => {
  const r = db.employees.insertOne(e);
  return { ...e, _id: r.insertedId };
});

const ids = inserted.map((e) => e._id.toString());

const absences = [];
ids.forEach((id, idx) => {
  const name = `${employees[idx].firstName} ${employees[idx].lastName}`;
  const count = 3 + (idx % 3);
  for (let i = 0; i < count; i++) {
    absences.push({
      employeeId: id,
      employeeName: name,
      type: i % 2 === 0 ? "MALADIE" : "AUTRE",
      startDate: daysAgo(5 + i * 12),
      endDate: daysAgo(4 + i * 12),
      days: 2,
      status: "approved",
      tenantId,
    });
  }
});

absences.forEach((a) => db.absences.insertOne(a));
print("Seeded " + inserted.length + " more employees and " + absences.length + " more absences.");
