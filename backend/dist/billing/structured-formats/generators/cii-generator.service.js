"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CIIGeneratorService = void 0;
const common_1 = require("@nestjs/common");
let CIIGeneratorService = class CIIGeneratorService {
    generate(invoice, tenant) {
        const cii = {
            '@xmlns': 'urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100',
            '@xmlns:ram': 'urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100',
            '@xmlns:rsm': 'urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100',
            '@xmlns:udt': 'urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100',
            'rsm:ExchangedDocument': {
                'ram:ID': invoice.number,
                'ram:IssueDateTime': {
                    'udt:DateTimeString': {
                        '@format': '102',
                        '#text': invoice.date.toISOString().replace(/[-:]/g, '').split('.')[0],
                    },
                },
                'ram:TypeCode': '380',
            },
            'rsm:SupplyChainTradeTransaction': {
                'ram:IncludedSupplyChainTradeLineItem': invoice.items.map((item, index) => ({
                    'ram:AssociatedDocumentLineDocument': {
                        'ram:LineID': (index + 1).toString(),
                    },
                    'ram:SpecifiedTradeProduct': {
                        'ram:Name': item.description,
                    },
                    'ram:SpecifiedLineTradeAgreement': {
                        'ram:NetPriceProductTradePrice': {
                            'ram:ChargeAmount': {
                                '@currencyID': 'EUR',
                                '#text': item.unitPrice.toFixed(2),
                            },
                        },
                    },
                    'ram:SpecifiedLineTradeDelivery': {
                        'ram:BilledQuantity': {
                            '@unitCode': 'C62',
                            '#text': item.quantity.toString(),
                        },
                    },
                    'ram:SpecifiedLineTradeSettlement': {
                        'ram:ApplicableTradeTax': {
                            'ram:TypeCode': 'VAT',
                            'ram:CategoryCode': 'S',
                            'ram:RateApplicablePercent': (item.vatRate || 20).toString(),
                        },
                        'ram:SpecifiedTradeSettlementLineMonetarySummation': {
                            'ram:LineTotalAmount': {
                                '@currencyID': 'EUR',
                                '#text': (item.quantity *
                                    item.unitPrice *
                                    (1 - (item.discount || 0) / 100)).toFixed(2),
                            },
                        },
                    },
                })),
                'ram:ApplicableHeaderTradeAgreement': {
                    'ram:SellerTradeParty': {
                        'ram:Name': tenant.businessName,
                        'ram:PostalTradeAddress': {
                            'ram:LineOne': tenant.address?.line1 || '',
                            'ram:CityName': tenant.address?.city || '',
                            'ram:PostcodeCode': tenant.address?.postalCode || '',
                            'ram:CountryID': tenant.address?.country || 'FR',
                        },
                        'ram:SpecifiedTaxRegistration': {
                            'ram:ID': {
                                '@schemeID': 'VA',
                                '#text': tenant.tvaNumber || '',
                            },
                        },
                    },
                    'ram:BuyerTradeParty': {
                        'ram:Name': invoice.client,
                        'ram:PostalTradeAddress': {
                            'ram:LineOne': invoice.clientAddress || '',
                        },
                    },
                },
                'ram:ApplicableHeaderTradeSettlement': {
                    'ram:InvoiceCurrencyCode': 'EUR',
                    'ram:SpecifiedTradeSettlementHeaderMonetarySummation': {
                        'ram:TaxBasisTotalAmount': {
                            '@currencyID': 'EUR',
                            '#text': invoice.amountHT.toFixed(2),
                        },
                        'ram:TaxTotalAmount': {
                            '@currencyID': 'EUR',
                            '#text': invoice.amountTVA.toFixed(2),
                        },
                        'ram:GrandTotalAmount': {
                            '@currencyID': 'EUR',
                            '#text': invoice.amountTTC.toFixed(2),
                        },
                        'ram:DuePayableAmount': {
                            '@currencyID': 'EUR',
                            '#text': invoice.amountTTC.toFixed(2),
                        },
                    },
                },
            },
        };
        return {
            format: 'CII',
            version: 'D16B',
            data: cii,
            xml: this.toXML(cii),
        };
    }
    toXML(obj) {
        return '<?xml version="1.0" encoding="UTF-8"?>\n' + this.objectToXML(obj, '');
    }
    objectToXML(obj, indent) {
        let xml = '';
        for (const [key, value] of Object.entries(obj)) {
            if (key.startsWith('@'))
                continue;
            if (Array.isArray(value)) {
                value.forEach((item) => {
                    xml += `${indent}<${key}>\n`;
                    xml += this.objectToXML(item, indent + '  ');
                    xml += `${indent}</${key}>\n`;
                });
            }
            else if (typeof value === 'object' && value !== null) {
                if (value['#text'] !== undefined) {
                    const attrs = Object.entries(value)
                        .filter(([k]) => k !== '#text')
                        .map(([k, v]) => `${k.replace('@', '')}="${v}"`)
                        .join(' ');
                    xml += `${indent}<${key}${attrs ? ' ' + attrs : ''}>${value['#text']}</${key}>\n`;
                }
                else {
                    xml += `${indent}<${key}>\n`;
                    xml += this.objectToXML(value, indent + '  ');
                    xml += `${indent}</${key}>\n`;
                }
            }
            else {
                xml += `${indent}<${key}>${value}</${key}>\n`;
            }
        }
        return xml;
    }
};
exports.CIIGeneratorService = CIIGeneratorService;
exports.CIIGeneratorService = CIIGeneratorService = __decorate([
    (0, common_1.Injectable)()
], CIIGeneratorService);
//# sourceMappingURL=cii-generator.service.js.map