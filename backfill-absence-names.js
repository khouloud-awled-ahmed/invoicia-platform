const absences = db.absences.find({ $or: [{ employeeName: { $exists: false } }, { employeeName: "" }] }).toArray();
let updated = 0;

absences.forEach((a) => {
  const emp = db.employees.findOne({ _id: ObjectId(a.employeeId) });
  if (emp) {
    db.absences.updateOne(
      { _id: a._id },
      { $set: { employeeName: emp.firstName + " " + emp.lastName } }
    );
    updated++;
  }
});

print("Backfilled employeeName on " + updated + " absence record(s) out of " + absences.length + " missing.");
