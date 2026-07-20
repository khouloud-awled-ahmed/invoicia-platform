content = open('src/components/AITemplateGenerator.tsx', encoding='utf-8').read()
old = "      const config = JSON.parse(ollamaData.response.match(/\\{[\\s\\S]*\\}/)[0]);\n      setGeneratedConfig(config);"
new = """      let config = { primaryColor: '#3b82f6', secondaryColor: '#1e40af', fontFamily: 'Arial', template: 'modern', customFields: [] };
      try {
        const match = ollamaData.response.match(/\\{[\\s\\S]*?\\}/);
        if (match) config = { ...config, ...JSON.parse(match[0]) };
      } catch(e) { console.log('Using default config'); }
      setGeneratedConfig(config);"""
result = content.replace(old, new)
open('src/components/AITemplateGenerator.tsx', 'w', encoding='utf-8').write(result)
print('Done! Found:', old in content)
