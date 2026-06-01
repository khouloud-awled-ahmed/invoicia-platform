import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Building2, Mail, Phone, Globe } from "lucide-react";

interface InvoicePreviewProps {
  data: {
    invoiceNumber: string;
    date: string;
    dueDate: string;
    client: string;
    clientAddress?: string;
    clientEmail?: string;
    items: Array<{
      description: string;
      quantity: number;
      unitPrice: number;
      discount?: number;
      vatRate: number;
    }>;
    deposit?: number;
    notes?: string;
  };
  companyData?: {
    legalName?: string;
    logo?: string | null;
    siret?: string;
    address?: string;
    email?: string;
    phone?: string;
    iban?: string;
    bic?: string;
    bankName?: string;
  };
  templateConfig?: {
    primaryColor?: string;
    secondaryColor?: string;
    fontFamily?: string;
    layout?: "classic" | "modern" | "minimal";
  };
}

export function InvoicePreview({ data, companyData = {}, templateConfig = {} }: InvoicePreviewProps) {
  const {
    primaryColor = "#1e40af",
    secondaryColor = "#60a5fa",
    fontFamily = "Arial",
    layout = "classic",
  } = templateConfig;

  // Calculs
  const totalHT = data.items.reduce((sum, item) => {
    const discount = item.discount || 0;
    return sum + (item.quantity * item.unitPrice * (1 - discount / 100));
  }, 0);

  const totalTVA = data.items.reduce((sum, item) => {
    const discount = item.discount || 0;
    const lineTotal = item.quantity * item.unitPrice * (1 - discount / 100);
    return sum + (lineTotal * item.vatRate / 100);
  }, 0);

  const totalTTC = totalHT + totalTVA;
  const deposit = data.deposit || 0;
  const totalToPay = totalTTC - deposit;

  return (
    <Card className="p-8 bg-white shadow-lg overflow-hidden">
      <style>
        {`
          .invoice-preview {
            font-family: ${fontFamily}, sans-serif;
          }
          .invoice-preview * {
            font-family: inherit;
          }
        `}
      </style>
      
      <div className="invoice-preview space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start pb-6 border-b-2" style={{ borderColor: primaryColor }}>
          <div className="space-y-2">
            {companyData.logo ? (
              <img
                src={companyData.logo}
                alt="Logo"
                className="h-16 w-auto object-contain mb-2"
              />
            ) : (
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-8 h-8" style={{ color: primaryColor }} />
                <h2 className="text-xl" style={{ color: primaryColor }}>
                  {companyData.legalName || "Votre Entreprise"}
                </h2>
              </div>
            )}
            
            <div className="text-sm text-gray-600 space-y-0.5">
              {companyData.address && <p>{companyData.address}</p>}
              {companyData.siret && <p>SIRET: {companyData.siret}</p>}
              {companyData.email && (
                <p className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {companyData.email}
                </p>
              )}
              {companyData.phone && (
                <p className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {companyData.phone}
                </p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <h1 className="text-4xl mb-2" style={{ color: primaryColor }}>
              FACTURE
            </h1>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="text-gray-600">N°:</span>{" "}
                <span className="font-semibold">{data.invoiceNumber || "FA-XXXX-XXX"}</span>
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Date:</span>{" "}
                {data.date ? new Date(data.date).toLocaleDateString("fr-FR") : "jj/mm/aaaa"}
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Échéance:</span>{" "}
                {data.dueDate ? new Date(data.dueDate).toLocaleDateString("fr-FR") : "jj/mm/aaaa"}
              </p>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm mb-3" style={{ color: secondaryColor }}>
              FACTURER À
            </h3>
            <div className="text-sm space-y-0.5">
              <p className="font-semibold">{data.client || "Nom du client"}</p>
              {data.clientAddress && (
                <p className="text-gray-600 whitespace-pre-line">{data.clientAddress}</p>
              )}
              {data.clientEmail && (
                <p className="text-gray-600 flex items-center gap-1 mt-2">
                  <Mail className="w-3 h-3" />
                  {data.clientEmail}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  backgroundColor: layout === "minimal" ? "#f8f9fa" : primaryColor,
                  color: layout === "minimal" ? "#000" : "#fff",
                }}
              >
                <th className="text-left p-3">Description</th>
                <th className="text-center p-3 w-20">Qté</th>
                <th className="text-right p-3 w-28">Prix Unit. HT</th>
                <th className="text-right p-3 w-24">Remise</th>
                <th className="text-right p-3 w-28">Total HT</th>
                <th className="text-right p-3 w-20">TVA</th>
              </tr>
            </thead>
            <tbody>
              {data.items.length > 0 ? (
                data.items.map((item, index) => {
                  const discount = item.discount || 0;
                  const lineTotal = item.quantity * item.unitPrice * (1 - discount / 100);
                  return (
                    <tr key={index} className="border-t">
                      <td className="p-3">{item.description || "Description du produit/service"}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">{item.unitPrice.toFixed(2)} €</td>
                      <td className="p-3 text-right">{discount > 0 ? `${discount}%` : "-"}</td>
                      <td className="p-3 text-right font-medium">{lineTotal.toFixed(2)} €</td>
                      <td className="p-3 text-right">{item.vatRate}%</td>
                    </tr>
                  );
                })
              ) : (
                <tr className="border-t">
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    Aucune ligne de facture
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-80 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total HT:</span>
              <span className="font-medium">{totalHT.toFixed(2)} €</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total TVA:</span>
              <span className="font-medium">{totalTVA.toFixed(2)} €</span>
            </div>

            <Separator />

            {deposit > 0 && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total TTC:</span>
                  <span className="font-medium">{totalTTC.toFixed(2)} €</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Acompte versé:</span>
                  <span className="font-medium text-green-600">- {deposit.toFixed(2)} €</span>
                </div>

                <Separator />
              </>
            )}

            <div className="flex justify-between pt-2">
              <span className="font-semibold text-lg">NET À PAYER:</span>
              <span
                className="font-semibold text-2xl"
                style={{ color: primaryColor }}
              >
                {totalToPay.toFixed(2)} €
              </span>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        {(companyData.iban || companyData.bankName) && (
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm mb-3" style={{ color: secondaryColor }}>
              COORDONNÉES BANCAIRES
            </h3>
            <div className="text-sm space-y-1 text-gray-700">
              {companyData.bankName && <p><strong>Banque:</strong> {companyData.bankName}</p>}
              {companyData.iban && <p><strong>IBAN:</strong> {companyData.iban}</p>}
              {companyData.bic && <p><strong>BIC:</strong> {companyData.bic}</p>}
            </div>
          </div>
        )}

        {/* Legal Mentions */}
        <div className="mt-6 pt-6 border-t text-xs text-gray-500 space-y-2">
          <p>Pénalités de retard (taux annuel) : 10,00 %</p>
          <p>Pas d'escompte en cas de paiement anticipé</p>
          <p>Indemnité forfaitaire pour frais de recouvrement en cas de retard de paiement : 40 €</p>
          {data.dueDate && (
            <p className="font-medium">
              Date limite de paiement: {new Date(data.dueDate).toLocaleDateString("fr-FR")}
            </p>
          )}
        </div>

        {/* Notes */}
        {data.notes && (
          <div className="mt-4 p-3 bg-blue-50 rounded text-sm">
            <p className="font-medium text-blue-900 mb-1">Notes:</p>
            <p className="text-blue-800 whitespace-pre-line">{data.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-400 pt-4 border-t">
          <p>Merci pour votre confiance !</p>
        </div>
      </div>
    </Card>
  );
}
