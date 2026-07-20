path = "backend/src/billing/sales/invoice-pdf.service.ts"
content = open(path, encoding="utf-8").read()
marker = "let y = height - 50;"
idx = content.find(marker) + len(marker)
before = content[:idx]
after = content[idx:]
insert = chr(10) + chr(10) + "    page.drawRectangle({" + chr(10) + "      x: 20," + chr(10) + "      y: 20," + chr(10) + "      width: width - 40," + chr(10) + "      height: height - 40," + chr(10) + "      borderColor: rgb(0, 0, 0)," + chr(10) + "      borderWidth: 2," + chr(10) + "    });"
result = before + insert + after
open(path, "w", encoding="utf-8").write(result)
print("Done")
