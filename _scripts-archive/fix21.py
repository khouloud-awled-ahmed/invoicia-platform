path = "backend/src/tenants/tenants.controller.ts"
content = open(path, encoding="utf-8").read()
marker = "updateInvoiceTemplateConfig(id, data);"
idx = content.find(marker) + len(marker)
end_idx = content.find("}", idx) + 1
before = content[:end_idx]
after = content[end_idx:]
q = chr(39)
insert = chr(10) + chr(10) + "  @Patch(" + q + ":id/default-terms" + q + ")" + chr(10) + "  updateDefaultTerms(@Param(" + q + "id" + q + ") id: string, @Body() data: any) {" + chr(10) + "    return this.tenantsService.updateDefaultTerms(id, data);" + chr(10) + "  }"
result = before + insert + after
open(path, "w", encoding="utf-8").write(result)
print("Done")
