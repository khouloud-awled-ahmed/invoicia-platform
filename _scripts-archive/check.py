content = open('src/components/InvoiceTemplateSettings.tsx', encoding='utf-8').read()
idx = content.find('apiClient.request')
print(repr(content[idx-10:idx+150]))
