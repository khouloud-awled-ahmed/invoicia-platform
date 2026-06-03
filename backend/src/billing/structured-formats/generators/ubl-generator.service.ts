import { Injectable } from '@nestjs/common';
import { Invoice, InvoiceDocument } from '../../sales/schemas/invoice.schema';
import { Tenant, TenantDocument } from '../../../tenants/schemas/tenant.schema';

@Injectable()
export class UBLGeneratorService {
  generate(invoice: InvoiceDocument, tenant: TenantDocument): any {
    // Génération du format UBL 2.1 (Universal Business Language)
    // Conforme à la norme ISO/IEC 19845:2015

    const ubl = {
      '@xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
      '@xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
      '@xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
      'cbc:CustomizationID':
        'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0',
      'cbc:ProfileID': 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0',
      'cbc:ID': invoice.number,
      'cbc:IssueDate': invoice.date.toISOString().split('T')[0],
      'cbc:DueDate': invoice.dueDate.toISOString().split('T')[0],
      'cbc:InvoiceTypeCode': '380',
      'cbc:DocumentCurrencyCode': 'EUR',
      'cac:AccountingSupplierParty': {
        'cac:Party': {
          'cac:PartyName': {
            'cbc:Name': tenant.businessName,
          },
          'cac:PostalAddress': {
            'cbc:StreetName': tenant.address?.line1 || '',
            'cbc:CityName': tenant.address?.city || '',
            'cbc:PostalZone': tenant.address?.postalCode || '',
            'cac:Country': {
              'cbc:IdentificationCode': tenant.address?.country || 'FR',
            },
          },
          'cac:PartyTaxScheme': {
            'cbc:CompanyID': tenant.matriculeFiscal || '',
            'cac:TaxScheme': {
              'cbc:ID': 'VAT',
            },
          },
          'cac:PartyLegalEntity': {
            'cbc:RegistrationName': tenant.businessName,
            'cbc:CompanyID': {
              '@schemeID': 'TUN:MF',
              '#text': tenant.matriculeFiscal || '',
            },
          },
        },
      },
      'cac:AccountingCustomerParty': {
        'cac:Party': {
          'cac:PartyName': {
            'cbc:Name': invoice.client,
          },
          'cac:PostalAddress': {
            'cbc:StreetName': invoice.clientAddress || '',
          },
        },
      },
      'cac:TaxTotal': {
        'cbc:TaxAmount': {
          '@currencyID': 'EUR',
          '#text': invoice.amountTVA.toFixed(2),
        },
      },
      'cac:LegalMonetaryTotal': {
        'cbc:LineExtensionAmount': {
          '@currencyID': 'EUR',
          '#text': invoice.amountHT.toFixed(2),
        },
        'cbc:TaxExclusiveAmount': {
          '@currencyID': 'EUR',
          '#text': invoice.amountHT.toFixed(2),
        },
        'cbc:TaxInclusiveAmount': {
          '@currencyID': 'EUR',
          '#text': invoice.amountTTC.toFixed(2),
        },
        'cbc:PayableAmount': {
          '@currencyID': 'EUR',
          '#text': invoice.amountTTC.toFixed(2),
        },
      },
      'cac:InvoiceLine': invoice.items.map((item, index) => ({
        'cbc:ID': (index + 1).toString(),
        'cbc:InvoicedQuantity': {
          '@unitCode': 'C62',
          '#text': item.quantity.toString(),
        },
        'cbc:LineExtensionAmount': {
          '@currencyID': 'EUR',
          '#text': (item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100)).toFixed(2),
        },
        'cac:Item': {
          'cbc:Name': item.description,
          'cac:ClassifiedTaxCategory': {
            'cbc:ID': 'S',
            'cbc:Percent': (item.vatRate || 20).toString(),
            'cac:TaxScheme': {
              'cbc:ID': 'VAT',
            },
          },
        },
        'cac:Price': {
          'cbc:PriceAmount': {
            '@currencyID': 'EUR',
            '#text': item.unitPrice.toFixed(2),
          },
        },
      })),
    };

    return {
      format: 'UBL',
      version: '2.1',
      data: ubl,
      xml: this.toXML(ubl),
    };
  }

  private toXML(obj: any, rootName = 'Invoice'): string {
    // Conversion simplifiée en XML (en production, utiliser une bibliothèque XML)
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootName}`;

    if (obj['@xmlns']) {
      xml += ` xmlns="${obj['@xmlns']}"`;
      delete obj['@xmlns'];
    }
    if (obj['@xmlns:cac']) {
      xml += ` xmlns:cac="${obj['@xmlns:cac']}"`;
      delete obj['@xmlns:cac'];
    }
    if (obj['@xmlns:cbc']) {
      xml += ` xmlns:cbc="${obj['@xmlns:cbc']}"`;
      delete obj['@xmlns:cbc'];
    }

    xml += '>\n';
    xml += this.objectToXML(obj, '');
    xml += `</${rootName}>`;

    return xml;
  }

  private objectToXML(obj: any, indent: string): string {
    let xml = '';
    for (const [key, value] of Object.entries(obj)) {
      if (key.startsWith('@')) continue;

      if (Array.isArray(value)) {
        value.forEach((item) => {
          xml += `${indent}<${key}>\n`;
          xml += this.objectToXML(item, indent + '  ');
          xml += `${indent}</${key}>\n`;
        });
      } else if (typeof value === 'object' && value !== null) {
        if (value['#text'] !== undefined) {
          const attrs = Object.entries(value)
            .filter(([k]) => k !== '#text')
            .map(([k, v]) => `${k}="${v}"`)
            .join(' ');
          xml += `${indent}<${key}${attrs ? ' ' + attrs : ''}>${value['#text']}</${key}>\n`;
        } else {
          xml += `${indent}<${key}>\n`;
          xml += this.objectToXML(value, indent + '  ');
          xml += `${indent}</${key}>\n`;
        }
      } else {
        xml += `${indent}<${key}>${value}</${key}>\n`;
      }
    }
    return xml;
  }
}
