import re
path = "backend/src/billing/sales/invoice-pdf.service.ts"
content = open(path, encoding="utf-8").read()

old = "    page.drawText(\"Designation\", { x: 50, y, size: 10, font: helveticaBoldFont });\n    page.drawText(\"Qte\", { x: 350, y, size: 10, font: helveticaBoldFont });\n    page.drawText(\"P.U.\", { x: 400, y, size: 10, font: helveticaBoldFont });\n    page.drawText(\"Montant\", { x: 500, y, size: 10, font: helveticaBoldFont });\n    y -= 18;"

new = """    page.drawRectangle({ x: 45, y: y - 5, width: width - 90, height: 20, color: primaryColor });
    page.drawText(\"Designation\", { x: 50, y, size: 10, font: helveticaBoldFont, color: rgb(1,1,1) });
    page.drawText(\"Qte\", { x: 350, y, size: 10, font: helveticaBoldFont, color: rgb(1,1,1) });
    page.drawText(\"P.U.\", { x: 400, y, size: 10, font: helveticaBoldFont, color: rgb(1,1,1) });
    page.drawText(\"Montant\", { x: 500, y, size: 10, font: helveticaBoldFont, color: rgb(1,1,1) });
    y -= 18;"""

result, count = (content.replace(old, new), content.count(old))
print("Found:", count)
open(path, "w", encoding="utf-8").write(result)
