printjson(db.invoices.findOne({number: "FA-2026-07-001"}, {number: 1, client: 1, clientEmail: 1, dueDate: 1, status: 1}))
