import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invoice, InvoiceDocument } from '../sales/schemas/invoice.schema';
import { Tenant, TenantDocument } from '../../tenants/schemas/tenant.schema';
import { StructuredFormatsService } from '../structured-formats/structured-formats.service';

// Liste des Plateformes Agréées par l'État français
const APPROVED_PLATFORMS = [
  {
    id: 'chorus-pro',
    name: 'Chorus Pro',
    url: 'https://chorus-pro.gouv.fr',
    apiEndpoint: 'https://api.chorus-pro.gouv.fr',
    description: 'Plateforme publique de facturation électronique',
  },
  {
    id: 'dematis',
    name: 'Dematis',
    url: 'https://www.dematis.fr',
    apiEndpoint: 'https://api.dematis.fr',
    description: 'Solution de dématérialisation',
  },
  {
    id: 'sap',
    name: 'SAP Ariba',
    url: 'https://www.ariba.com',
    apiEndpoint: 'https://api.ariba.com',
    description: 'Plateforme de facturation électronique',
  },
  {
    id: 'tradeshift',
    name: 'Tradeshift',
    url: 'https://www.tradeshift.com',
    apiEndpoint: 'https://api.tradeshift.com',
    description: 'Réseau de facturation électronique',
  },
];

@Injectable()
export class PlatformAgreementService {
  constructor(
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    private structuredFormatsService: StructuredFormatsService,
  ) {}

  async isEnabled(tenantId: string): Promise<boolean> {
    const tenant = await this.tenantModel.findById(tenantId).exec();
    return tenant?.features?.includes('platform-agreement') || false;
  }

  async getStatus(tenantId: string): Promise<any> {
    const isEnabled = await this.isEnabled(tenantId);
    const tenant = await this.tenantModel.findById(tenantId).exec();

    return {
      enabled: isEnabled,
      configured: !!(tenant?.metadata?.platformAgreementConfig),
      platform: tenant?.metadata?.platformAgreementConfig?.platform || null,
      credentialsConfigured: !!(tenant?.metadata?.platformAgreementConfig?.apiKey),
    };
  }

  async getAvailablePlatforms(): Promise<any[]> {
    return APPROVED_PLATFORMS;
  }

  async transmitInvoice(
    invoiceId: string,
    tenantId: string,
    format: 'UBL' | 'CII' | 'Factur-X',
    platformId?: string,
  ): Promise<any> {
    const isEnabled = await this.isEnabled(tenantId);
    if (!isEnabled) {
      throw new ForbiddenException('Platform Agreement is not enabled for this tenant');
    }

    const invoice = await this.invoiceModel.findOne({ _id: invoiceId, tenantId }).exec();
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    const tenant = await this.tenantModel.findById(tenantId).exec();
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    const config = tenant.metadata?.platformAgreementConfig;
    if (!config || !config.platform || !config.apiKey) {
      throw new BadRequestException(
        'Platform Agreement is not configured. Please configure platform credentials in tenant settings.',
      );
    }

    const platform = platformId
      ? APPROVED_PLATFORMS.find((p) => p.id === platformId)
      : APPROVED_PLATFORMS.find((p) => p.id === config.platform);

    if (!platform) {
      throw new BadRequestException(`Platform ${platformId || config.platform} is not available`);
    }

    // Générer le format structuré
    const structuredData = await this.structuredFormatsService.generateInvoice(
      invoiceId,
      format,
      tenantId,
    );

    // Transmettre à la Plateforme Agréée
    try {
      const transmissionResult = await this.transmitToPlatform(
        platform,
        structuredData,
        config.apiKey,
        invoice,
      );

      // Enregistrer le statut de transmission
      await this.invoiceModel.findByIdAndUpdate(invoiceId, {
        $set: {
          'metadata.platformTransmission': {
            platform: platform.id,
            format,
            transmittedAt: new Date(),
            status: 'success',
            reference: transmissionResult.reference,
            response: transmissionResult,
          },
        },
      });

      return {
        success: true,
        invoiceId,
        platform: platform.name,
        format,
        reference: transmissionResult.reference,
        transmittedAt: new Date(),
      };
    } catch (error) {
      // Enregistrer l'erreur
      await this.invoiceModel.findByIdAndUpdate(invoiceId, {
        $set: {
          'metadata.platformTransmission': {
            platform: platform.id,
            format,
            transmittedAt: new Date(),
            status: 'error',
            error: error.message,
          },
        },
      });

      throw new BadRequestException(`Failed to transmit invoice: ${error.message}`);
    }
  }

  private async transmitToPlatform(
    platform: any,
    structuredData: any,
    apiKey: string,
    invoice: InvoiceDocument,
  ): Promise<any> {
    // Simulation de transmission à la Plateforme Agréée
    // En production, implémenter les appels API réels selon la documentation de chaque plateforme

    const endpoint = `${platform.apiEndpoint}/invoices`;
    const payload = {
      invoice: structuredData.xml || structuredData.data,
      format: structuredData.format,
      invoiceNumber: invoice.number,
      invoiceDate: invoice.date,
      amount: invoice.amountTTC,
    };

    // TODO: Implémenter l'appel HTTP réel avec axios ou fetch
    // const response = await axios.post(endpoint, payload, {
    //   headers: {
    //     'Authorization': `Bearer ${apiKey}`,
    //     'Content-Type': 'application/xml',
    //   },
    // });

    // Simulation pour le développement
    return {
      reference: `PA-${Date.now()}-${invoice.number}`,
      status: 'accepted',
      message: 'Invoice transmitted successfully',
      platformResponse: {
        // Réponse simulée de la plateforme
        id: `platform-ref-${Date.now()}`,
        receivedAt: new Date().toISOString(),
      },
    };
  }

  async getTransmissionStatus(invoiceId: string, tenantId: string): Promise<any> {
    const invoice = await this.invoiceModel.findOne({ _id: invoiceId, tenantId }).exec();
    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${invoiceId} not found`);
    }

    const transmission = invoice.metadata?.platformTransmission;
    if (!transmission) {
      return {
        transmitted: false,
        message: 'Invoice has not been transmitted to a Platform Agreement',
      };
    }

    return {
      transmitted: true,
      platform: transmission.platform,
      format: transmission.format,
      status: transmission.status,
      reference: transmission.reference,
      transmittedAt: transmission.transmittedAt,
      error: transmission.error,
    };
  }
}
