const tenantId = "69ca41f139c12b72252a7e49";

function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

const employees = [
  { firstName: "Sami", lastName: "Trabelsi", email: "sami.trabelsi@test.invocia.tn", position: "Développeur", department: "IT", salary: 2200, status: "active", tenantId: tenantId },
  { firstName: "Nour", lastName: "Ben Salah", email: "nour.bensalah@test.invocia.tn", position: "Comptable", department: "Finance", salary: 1900, status: "active", tenantId: tenantId },
  { firstName: "Karim", lastName: "Gharbi", email: "karim.gharbi@test.invocia.tn", position: "Commercial", department: "Ventes", salary: 2000, status: "active", tenantId: tenantId },
  { firstName: "Amel", lastName: "Jridi", email: "amel.jridi@test.invocia.tn", position: "RH", department: "Ressources Humaines", salary: 2100, status: "active", tenantId: tenantId },
];

const insertedEmployees = employees.map((emp) => {
  const res = db.employees.insertOne(emp);
  return { ...emp, _id: res.insertedId };
});

const samiId = insertedEmployees[0]._id.toString();
const nourId = insertedEmployees[1]._id.toString();
const karimId = insertedEmployees[2]._id.toString();
const amelId = insertedEmployees[3]._id.toString();

const absences = [
  { employeeId: samiId, employeeName: "Sami Trabelsi", type: "CP", startDate: daysAgo(150), endDate: daysAgo(148), days: 3, status: "approved", tenantId: tenantId },

  { employeeId: nourId, employeeName: "Nour Ben Salah", type: "RTT", startDate: daysAgo(75), endDate: daysAgo(75), days: 1, status: "approved", tenantId: tenantId },
  { employeeId: nourId, employeeName: "Nour Ben Salah", type: "MALADIE", startDate: daysAgo(40), endDate: daysAgo(38), days: 3, status: "approved", tenantId: tenantId },
  { employeeId: nourId, employeeName: "Nour Ben Salah", type: "CP", startDate: daysAgo(20), endDate: daysAgo(18), days: 3, status: "approved", tenantId: tenantId },

  { employeeId: karimId, employeeName: "Karim Gharbi", type: "MALADIE", startDate: daysAgo(150), endDate: daysAgo(149), days: 2, status: "approved", tenantId: tenantId },
  { employeeId: karimId, employeeName: "Karim Gharbi", type: "MALADIE", startDate: daysAgo(65), endDate: daysAgo(63), days: 3, status: "approved", tenantId: tenantId },
  { employeeId: karimId, employeeName: "Karim Gharbi", type: "AUTRE", startDate: daysAgo(45), endDate: daysAgo(45), days: 1, status: "approved", tenantId: tenantId },
  { employeeId: karimId, employeeName: "Karim Gharbi", type: "MALADIE", startDate: daysAgo(25), endDate: daysAgo(22), days: 4, status: "approved", tenantId: tenantId },
  { employeeId: karimId, employeeName: "Karim Gharbi", type: "MALADIE", startDate: daysAgo(10), endDate: daysAgo(8), days: 3, status: "approved", tenantId: tenantId },
  { employeeId: karimId, employeeName: "Karim Gharbi", type: "AUTRE", startDate: daysAgo(5), endDate: daysAgo(5), days: 1, status: "approved", tenantId: tenantId },

  { employeeId: amelId, employeeName: "Amel Jridi", type: "CP", startDate: daysAgo(60), endDate: daysAgo(55), days: 6, status: "approved", tenantId: tenantId },
  { employeeId: amelId, employeeName: "Amel Jridi", type: "RTT", startDate: daysAgo(15), endDate: daysAgo(15), days: 1, status: "approved", tenantId: tenantId },
];

absences.forEach((a) => db.absences.insertOne(a));

print("Seeded " + insertedEmployees.length + " employees and " + absences.length + " absences.");
