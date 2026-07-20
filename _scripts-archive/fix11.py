content = open('src/components/InvoiceTemplateSettings.tsx', encoding='utf-8').read()
old = '''  const handleSaveTemplate = () => {
    setTemplateConfig(currentConfig);
    console.log("Saving template configuration:", currentConfig);
    toast.success("Mod\u00e8le de facture enregistr\u00e9 avec succ\u00e8s !");
  };'''
new = '''  const handleSaveTemplate = async () => {
    setTemplateConfig(currentConfig);
    try {
      const tenantId = tenant?._id || tenant?.id;
      if (tenantId) {
        await apiClient.request(\/tenants/\/invoice-template-config\, {
          method: "PATCH",
          body: JSON.stringify({
            primaryColor: currentConfig.primaryColor,
            secondaryColor: currentConfig.secondaryColor,
            fontFamily: currentConfig.fontFamily,
            template: currentConfig.id,
          }),
        });
      }
      toast.success("Mod\u00e8le de facture enregistr\u00e9 avec succ\u00e8s !");
    } catch (err) {
      console.error("Erreur sauvegarde template:", err);
      toast.error("Erreur lors de l'enregistrement du mod\u00e8le");
    }
  };'''
result = content.replace(old, new, 1)
open('src/components/InvoiceTemplateSettings.tsx', 'w', encoding='utf-8').write(result)
print('Done! Found:', old in content)
