content = open('src/components/InvoiceTemplateSettings.tsx', encoding='utf-8').read()
old = """              setCurrentConfig(config);
              setSelectedTemplate(config.id);
              toast.success("Mod\u00e8le IA appliqu\u00e9 ! Vous pouvez maintenant le personnaliser.");"""
new = """              const aiConfig = { ...templateConfig, ...config, id: 'modern', name: 'Modele IA' };
              setCurrentConfig(aiConfig);
              setSelectedTemplate('modern');
              toast.success("Modele IA applique !");"""
result = content.replace(old, new)
open('src/components/InvoiceTemplateSettings.tsx', 'w', encoding='utf-8').write(result)
print('Done! Found:', old in content)
