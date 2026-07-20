content = open('backend/src/tenants/tenants.service.ts', encoding='utf-8').read()
old = '''  async updateBankAccount('''
new = '''  async updateInvoiceTemplateConfig(
    id: string,
    config: { primaryColor: string; secondaryColor: string; fontFamily: string; template: string },
  ): Promise<Tenant> {
    await this.findOne(id);
    return this.tenantModel
      .findByIdAndUpdate(id, { invoiceTemplateConfig: config }, { new: true })
      .exec();
  }

  async updateBankAccount('''
result = content.replace(old, new, 1)
open('backend/src/tenants/tenants.service.ts', 'w', encoding='utf-8').write(result)
print('Done! Found:', old in content)
