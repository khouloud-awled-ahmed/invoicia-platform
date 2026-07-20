import re
path = "src/components/InvoiceTemplateSettings.tsx"
content = open(path, encoding="utf-8").read()
pattern = r"apiClient\.request\(\\+/tenants/\\+/invoice-template-config\\+,\s*\{"
new = "apiClient.request(`/tenants/${tenantId}/invoice-template-config`, {"
result, count = re.subn(pattern, new, content)
print("Replacements made:", count)
open(path, "w", encoding="utf-8").write(result)
