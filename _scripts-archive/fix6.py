content = open('src/components/AITemplateGenerator.tsx', encoding='utf-8').read()
old = 'prompt: "Generate invoice template JSON with primaryColor, secondaryColor, fontFamily, template field (classic/modern/minimalist), customFields array for: " + textDescription + ". Return ONLY JSON.", stream: false'
new = 'prompt: "Return ONLY this JSON, no text: {\"primaryColor\":\"#COLOR\",\"secondaryColor\":\"#COLOR2\",\"fontFamily\":\"FONT\",\"template\":\"STYLE\"} where: if user wants green use #16a34a, blue use #3b82f6, purple use #7c3aed, red use #dc2626. Font: Arial or Times New Roman. Style: classic, modern or minimalist. User request: " + textDescription, stream: false'
result = content.replace(old, new)
open('src/components/AITemplateGenerator.tsx', 'w', encoding='utf-8').write(result)
print('Done! Found:', old in content)
