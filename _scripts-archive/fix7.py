content = open('backend/src/billing/sales/invoice-pdf.service.ts', encoding='utf-8').read()
old = 'let y = height - 50;\n\n    // En-t\u00eate\n    page.drawText(tenant.businessName || tenant.name, {\n      x: 50,\n      y,\n      size: 18,\n      font: helveticaBoldFont,\n    });'
new = '''let y = height - 50;

    const templateColor = (tenant as any).invoiceTemplateConfig?.primaryColor || '#000000';
    const hexToRgb = (hex: string) => {
      const cleaned = hex.replace('#', '');
      const r = parseInt(cleaned.substring(0, 2), 16) / 255;
      const g = parseInt(cleaned.substring(2, 4), 16) / 255;
      const b = parseInt(cleaned.substring(4, 6), 16) / 255;
      return rgb(r, g, b);
    };
    const primaryColor = hexToRgb(templateColor);

    // En-tete
    page.drawText(tenant.businessName || tenant.name, {
      x: 50,
      y,
      size: 18,
      font: helveticaBoldFont,
      color: primaryColor,
    });'''
result = content.replace(old, new)
open('backend/src/billing/sales/invoice-pdf.service.ts', 'w', encoding='utf-8').write(result)
print('Done! Found:', old in content)
