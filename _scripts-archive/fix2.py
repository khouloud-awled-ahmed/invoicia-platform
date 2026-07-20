content = open('src/components/AITemplateGenerator.tsx', encoding='utf-8').read()
old = '         toast.error("Fonctionnalite de generation de template IA en cours d\'implementation");\n      setGenerationProgress(100);'
new = '      setGenerationProgress(100);'
result = content.replace(old, new)
open('src/components/AITemplateGenerator.tsx', 'w', encoding='utf-8').write(result)
print('Done!')
