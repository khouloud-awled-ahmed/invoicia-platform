path = "backend/src/billing/sales/invoice-pdf.service.ts"
content = open(path, encoding="utf-8").read()
marker = "Lignes"
idx = content.find(marker)
end_idx = content.find("y -= 18;", idx) + len("y -= 18;")
before = content[:idx]
after = content[end_idx:]
new_block = "Lignes\n    page.drawRectangle({ x: 45, y: y - 5, width: width - 90, height: 20, color: primaryColor });\n    page.drawText(" + chr(39) + "Designation" + chr(39) + ", { x: 50, y, size: 10, font: helveticaBoldFont, color: rgb(1,1,1) });\n    page.drawText(" + chr(39) + "Qte" + chr(39) + ", { x: 350, y, size: 10, font: helveticaBoldFont, color: rgb(1,1,1) });\n    page.drawText(" + chr(39) + "P.U." + chr(39) + ", { x: 400, y, size: 10, font: helveticaBoldFont, color: rgb(1,1,1) });\n    page.drawText(" + chr(39) + "Montant" + chr(39) + ", { x: 500, y, size: 10, font: helveticaBoldFont, color: rgb(1,1,1) });\n    y -= 18;"
result = before + new_block + after
open(path, "w", encoding="utf-8").write(result)
print("Done")
