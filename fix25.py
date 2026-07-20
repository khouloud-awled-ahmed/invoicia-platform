path = "backend/src/billing/sales/invoice-pdf.service.ts"
content = open(path, encoding="utf-8").read()
marker = "borderWidth: 2,"
idx = content.find(marker)
end_idx = content.find("});", idx) + 3
before = content[:end_idx]
after = content[end_idx:]
insert = chr(10) + chr(10) + "    const status = (invoice as any).status || " + chr(39) + "pending" + chr(39) + ";" + chr(10) + "    const statusLabel = status === " + chr(39) + "paid" + chr(39) + " ? " + chr(39) + "PAYEE" + chr(39) + " : status === " + chr(39) + "overdue" + chr(39) + " ? " + chr(39) + "EN RETARD" + chr(39) + " : " + chr(39) + "EN ATTENTE" + chr(39) + ";" + chr(10) + "    const statusColor = status === " + chr(39) + "paid" + chr(39) + " ? rgb(0.13, 0.55, 0.13) : status === " + chr(39) + "overdue" + chr(39) + " ? rgb(0.8, 0.1, 0.1) : rgb(0.9, 0.6, 0.1);" + chr(10) + "    page.drawRectangle({ x: width - 150, y: height - 70, width: 100, height: 22, color: statusColor });" + chr(10) + "    page.drawText(statusLabel, { x: width - 145, y: height - 64, size: 9, font: helveticaBoldFont, color: rgb(1,1,1) });"
result = before + insert + after
open(path, "w", encoding="utf-8").write(result)
print("Done")
