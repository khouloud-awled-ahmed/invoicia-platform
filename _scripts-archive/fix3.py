content = open('src/components/AITemplateGenerator.tsx', encoding='utf-8').read()
old = '         toast.error("Fonctionnalit\u00e9 de g\u00e9n\u00e9ration de template IA en cours d\'impl\u00e9mentation");\n'
new = ''
result = content.replace(old, new)
open('src/components/AITemplateGenerator.tsx', 'w', encoding='utf-8').write(result)
print('Done! Found:', old in content)
