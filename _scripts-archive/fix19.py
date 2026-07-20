path = "backend/src/tenants/tenants.service.ts"
content = open(path, encoding="utf-8").read()
old = "  async updateBillingSettings("
new = """  async updateDefaultTerms(
    id: string,
    data: {
      penaltyRate?: number;
      penaltyDescription?: string;
      recoveryFee?: number;
      discountPolicy?: string;
      paymentTermsDefault?: number;
    },
  ): Promise<Tenant> {
    await this.findOne(id);
    return this.tenantModel
      .findByIdAndUpdate(id, { defaultTerms: data }, { new: true })
      .exec();
  }

  async updateBillingSettings("""
result = content.replace(old, new, 1)
open(path, "w", encoding="utf-8").write(result)
print("Done! Found:", old in content)
