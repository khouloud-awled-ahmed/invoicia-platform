path = "backend/src/billing/sales/invoice-pdf.service.ts"
content = open(path, encoding="utf-8").read()
marker = "Lignes"
idx = content.find(marker)
end_idx = content.find("y -= 18;", idx) + len("y -= 18;")
old_block = content[idx:end_idx]
print(repr(old_block))
