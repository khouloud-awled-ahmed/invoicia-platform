content = open('backend/src/tenants/tenants.controller.ts', encoding='utf-8').read()
old = '''  @Patch(':id/bank-account')
  updateBankAccount(@Param('id') id: string, @Body() data: any) {
    return this.tenantsService.updateBankAccount(id, data);
  }'''
new = '''  @Patch(':id/bank-account')
  updateBankAccount(@Param('id') id: string, @Body() data: any) {
    return this.tenantsService.updateBankAccount(id, data);
  }
  @Patch(':id/invoice-template-config')
  updateInvoiceTemplateConfig(@Param('id') id: string, @Body() data: any) {
    return this.tenantsService.updateInvoiceTemplateConfig(id, data);
  }'''
result = content.replace(old, new, 1)
open('backend/src/tenants/tenants.controller.ts', 'w', encoding='utf-8').write(result)
print('Done! Found:', old in content)
