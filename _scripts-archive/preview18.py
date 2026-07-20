path = "backend/src/billing/sales/invoice-pdf.service.ts"
content = open(path, encoding="utf-8").read()
marker = "Lignes"
idx = content.find(marker)

before = content[:idx]

insert = """// FACTURER A
page.drawText(
'FACTURER A'
, { x: 50, y, size: 11, font: helveticaBoldFont, color: secondaryColorRgb });
y -= 16;
page.drawText(String(invoice.client || 
''
), { x: 50, y, size: 10, font: helveticaBoldFont });
y -= 25;

"""
print(repr(insert[:200]))
