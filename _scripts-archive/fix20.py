path = "backend/src/tenants/tenants.controller.ts"
content = open(path, encoding="utf-8").read()
old = "  @Patch(
':id/invoice-template-config'
)\n  updateInvoiceTemplateConfig(@Param(
'id'
) id: string, @Body() data: any) {\n    return this.tenantsService.updateInvoiceTemplateConfig(id, data);\n  }"
new = old + "\n  @Patch(
':id/default-terms'
)\n  updateDefaultTerms(@Param(
'id'
) id: string, @Body() data: any) {\n    return this.tenantsService.updateDefaultTerms(id, data);\n  }"
result = content.replace(old, new, 1)
open(path, "w", encoding="utf-8").write(result)
print("Done! Found:", old in content)
