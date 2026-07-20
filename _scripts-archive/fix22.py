path = "src/components/CompanySettingsEnhanced.tsx"
content = open(path, encoding="utf-8").read()
marker = "iban: companyData.iban.trim(),"
idx2 = content.find("bic: companyData.bic.trim(),")
end_marker_idx = content.find("});", idx2) + 3
before = content[:end_marker_idx]
after = content[end_marker_idx:]
q = chr(39)
bq = chr(96)
insert = chr(10) + "      }" + chr(10) + "      if (companyData.penaltyRate || companyData.discountPolicy) {" + chr(10) + "        const tenantId = tenant" + chr(63) + "." + chr(95) + "id;" + chr(10) + "        await apiClient.request(" + bq + "/tenants/" + chr(36) + "{tenantId}/default-terms" + bq + ", {" + chr(10) + "          method: " + chr(34) + "PATCH" + chr(34) + "," + chr(10) + "          body: JSON.stringify({" + chr(10) + "            penaltyRate: parseFloat(companyData.penaltyRate) || 0," + chr(10) + "            penaltyDescription: companyData.penaltyDescription," + chr(10) + "            recoveryFee: parseFloat(companyData.recoveryFee) || 0," + chr(10) + "            discountPolicy: companyData.discountPolicy," + chr(10) + "            paymentTermsDefault: parseInt(companyData.paymentTermsDefault) || 30," + chr(10) + "          })," + chr(10) + "        });"
result = before + insert + after
open(path, "w", encoding="utf-8").write(result)
print("Done")
