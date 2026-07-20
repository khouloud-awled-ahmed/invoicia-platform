content = open('src/components/AITemplateGenerator.tsx', encoding='utf-8').read()
old = '   // TODO: Implémenter generateTemplateFromText dans api-client-backend.ts\n      // const result = await apiClient.generateTemplateFromText(textDescription);\n      // setGeneratedConfig(result);\n      \n   '
new = '      const ollamaResponse = await fetch("http://localhost:11434/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "tinyllama", prompt: "Generate invoice template JSON with primaryColor, secondaryColor, fontFamily, template field (classic/modern/minimalist), customFields array for: " + textDescription + ". Return ONLY JSON.", stream: False }) });\n      const ollamaData = await ollamaResponse.json();\n      const config = JSON.parse(ollamaData.response.match(/\{[\s\S]*\}/)[0]);\n      setGeneratedConfig(config);\n      toast.success("Template generated!");\n      '
result = content.replace(old, new)
open('src/components/AITemplateGenerator.tsx', 'w', encoding='utf-8').write(result)
print('Done! Replaced:', old in content)
