content = open('src/components/InvoiceTemplateSettings.tsx', encoding='utf-8').read()
old = 'apiClient.request(\\\\/tenants/\\\\/invoice-template-config\\\\, {'
new = 'apiClient.request(\u0060/tenants/\u0024{tenantId}/invoice-template-config\u0060, {'
result = content.replace(old, new)
open('src/components/InvoiceTemplateSettings.tsx', 'w', encoding='utf-8').write(result)
print('Done! Found:', old in content)
