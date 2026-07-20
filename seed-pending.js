const tenantId = "69ca41f139c12b72252a7e49";
function daysAgo(n) { return new Date(Date.now() - n * 24 * 60 * 60 * 1000); }
function daysFromNow(n) { return new Date(Date.now() + n * 24 * 60 * 60 * 1000); }

const karim = db.employees.findOne({ firstName: "Karim", lastName: "Gharbi" });
const sami = db.employees.findOne({ firstName: "Sami", lastName: "Trabelsi" });

const pendingAbsences = [
  {
    employeeId: karim._id.toString(),
    employeeName: "Karim Gharbi",
    type: "MALADIE",
    startDate: daysFromNow(1),
    endDate: daysFromNow(3),
    days: 3,
    status: "pending",
    reason: "Grippe",
    tenantId: tenantId,
  },
  {
    employeeId: sami._id.toString(),
    employeeName: "Sami Trabelsi",
    type: "CP",
    startDate: daysFromNow(10),
    endDate: daysFromNow(14),
    days: 5,
    status: "pending",
    reason: "Vacances",
    tenantId: tenantId,
  },
];

pendingAbsences.forEach((a) => db.absences.insertOne(a));
print("Seeded " + pendingAbsences.length + " pending absence requests.");
