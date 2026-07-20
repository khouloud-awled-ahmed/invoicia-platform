content = open('backend/src/tenants/schemas/tenant.schema.ts', encoding='utf-8').read()
old = '  @Prop()\n  capital?: number;'
new = '''  @Prop()
  capital?: number;

  @Prop({ type: Object })
  invoiceTemplateConfig?: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    template: string;
  };'''
result = content.replace(old, new, 1)
open('backend/src/tenants/schemas/tenant.schema.ts', 'w', encoding='utf-8').write(result)
print('Done! Found:', old in content)
