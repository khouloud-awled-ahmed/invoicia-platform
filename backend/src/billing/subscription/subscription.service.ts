import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from '../../tenants/schemas/tenant.schema';
import {
  SubscriptionPlan,
  SubscriptionPlanDocument,
} from '../../platform/schemas/subscription-plan.schema';
import { PromoCode, PromoCodeDocument } from '../schemas/promo-code.schema';
import {
  PlatformSettings,
  PlatformSettingsDocument,
} from '../../platform/schemas/platform-settings.schema';
import { SubscribeDto } from './dto/subscribe.dto';
import { PlatformInvoicesService } from '../../platform/platform-invoices/platform-invoices.service';
import { PlatformInvoicePaymentMethod } from '../../platform/schemas/platform-invoice.schema';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    @InjectModel(SubscriptionPlan.name) private planModel: Model<SubscriptionPlanDocument>,
    @InjectModel(PromoCode.name) private promoCodeModel: Model<PromoCodeDocument>,
    @InjectModel(PlatformSettings.name) private settingsModel: Model<PlatformSettingsDocument>,
    private platformInvoicesService: PlatformInvoicesService,
  ) {}

  async subscribe(tenantId: string, subscribeDto: SubscribeDto) {
    const tenant = await this.tenantModel.findById(tenantId).exec();
    if (!tenant) {
      throw new NotFoundException('Tenant non trouvé');
    }

    const plan = await this.planModel.findById(subscribeDto.planId).exec();
    if (!plan) {
      throw new NotFoundException('Plan non trouvé');
    }

    if (!plan.isActive) {
      throw new BadRequestException("Ce plan n'est plus actif");
    }

    // Calculer le prix avec code promo
    let finalPrice = plan.price;
    let promoCode = null;

    if (subscribeDto.promoCode) {
      promoCode = await this.promoCodeModel
        .findOne({
          code: subscribeDto.promoCode.toUpperCase(),
          isActive: true,
        })
        .exec();

      if (promoCode) {
        // Vérifier expiration
        if (promoCode.expirationDate && new Date() > promoCode.expirationDate) {
          throw new BadRequestException('Code promo expiré');
        }

        // Vérifier limite d'utilisation
        if (promoCode.maxUsage && promoCode.usageCount >= promoCode.maxUsage) {
          throw new BadRequestException('Code promo épuisé');
        }

        // Vérifier applicabilité au plan
        if (promoCode.applicablePlans && promoCode.applicablePlans.length > 0) {
          if (!promoCode.applicablePlans.includes(plan._id.toString())) {
            throw new BadRequestException('Code promo non applicable à ce plan');
          }
        }

        // Appliquer la réduction
        if (promoCode.discountType === 'PERCENT') {
          finalPrice = plan.price * (1 - promoCode.value / 100);
        } else if (promoCode.discountType === 'AMOUNT') {
          finalPrice = Math.max(0, plan.price - promoCode.value);
        }

        // Incrémenter le compteur d'utilisation
        promoCode.usageCount++;
        await promoCode.save();
      } else {
        throw new BadRequestException('Code promo invalide');
      }
    }

    // Mettre à jour les infos du tenant
    if (subscribeDto.billingDetails) {
      if (subscribeDto.billingDetails.address) {
        tenant.settings = tenant.settings || {};
        tenant.settings.companyAddress = subscribeDto.billingDetails.address;
      }
      if (subscribeDto.billingDetails.vatNumber) {
        tenant.settings = tenant.settings || {};
        tenant.settings.vatNumber = subscribeDto.billingDetails.vatNumber;
      }
      if (subscribeDto.billingDetails.matriculeFiscal) {
        tenant.matriculeFiscal = subscribeDto.billingDetails.matriculeFiscal;
      }
    }

    // Traiter le paiement selon la méthode
    if (subscribeDto.paymentMethod === 'CARD') {
      // Simuler un paiement Stripe réussi
      console.log(`[STRIPE MOCK] Paiement de ${finalPrice}€ pour le plan ${plan.name}`);

      tenant.subscriptionStatus = 'ACTIVE';
      tenant.status = 'active';
      tenant.planId = plan._id.toString();
      tenant.modules = plan.features;
      tenant.maxUsers = plan.maxUsers;

      // Calculer la date de fin d'abonnement (1 mois)
      const subscriptionEndsAt = new Date();
      subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);
      tenant.subscriptionEndsAt = subscriptionEndsAt;

      // Générer la facture automatiquement
      try {
        await this.platformInvoicesService.createInvoice(
          tenant._id.toString(),
          plan._id.toString(),
          finalPrice,
          PlatformInvoicePaymentMethod.CARD,
          subscribeDto.promoCode,
          promoCode ? plan.price - finalPrice : 0,
          plan.price,
        );
        console.log(`[INVOICE] Facture générée pour le tenant ${tenant._id}`);
      } catch (error) {
        console.error(`[INVOICE] Erreur lors de la génération de la facture:`, error);
        // Ne pas bloquer l'abonnement si la facture échoue
      }
    } else if (subscribeDto.paymentMethod === 'TRANSFER') {
      // Récupérer les settings pour la période de grâce
      const settings = await this.settingsModel.findOne({ id: 'platform' }).exec();
      const trialDays = settings?.defaultTrialDaysForTransfer || 7;

      tenant.subscriptionStatus = 'TRIAL';
      tenant.status = 'trial';
      tenant.planId = plan._id.toString();
      tenant.modules = plan.features;
      tenant.maxUsers = plan.maxUsers;

      // Période d'essai jusqu'à validation du virement
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);
      tenant.trialEndsAt = trialEndsAt;

      // Créer une facture DRAFT (pro-forma) qui sera finalisée après validation du virement
      try {
        await this.platformInvoicesService.createInvoice(
          tenant._id.toString(),
          plan._id.toString(),
          finalPrice,
          PlatformInvoicePaymentMethod.TRANSFER,
          subscribeDto.promoCode,
          promoCode ? plan.price - finalPrice : 0,
          plan.price,
        );
        console.log(
          `[INVOICE] Facture pro-forma créée pour le tenant ${tenant._id} (en attente de virement)`,
        );
      } catch (error) {
        console.error(`[INVOICE] Erreur lors de la création de la facture pro-forma:`, error);
      }
    }

    await tenant.save();

    return {
      success: true,
      subscriptionStatus: tenant.subscriptionStatus,
      trialEndsAt: tenant.trialEndsAt,
      subscriptionEndsAt: tenant.subscriptionEndsAt,
      finalPrice,
      promoCodeApplied: promoCode ? promoCode.code : null,
    };
  }

  async validatePromoCode(code: string, planId: string) {
    const promoCode = await this.promoCodeModel
      .findOne({
        code: code.toUpperCase(),
        isActive: true,
      })
      .exec();

    if (!promoCode) {
      return { valid: false, message: 'Code promo invalide' };
    }

    if (promoCode.expirationDate && new Date() > promoCode.expirationDate) {
      return { valid: false, message: 'Code promo expiré' };
    }

    if (promoCode.maxUsage && promoCode.usageCount >= promoCode.maxUsage) {
      return { valid: false, message: 'Code promo épuisé' };
    }

    if (promoCode.applicablePlans && promoCode.applicablePlans.length > 0) {
      if (!promoCode.applicablePlans.includes(planId)) {
        return { valid: false, message: 'Code promo non applicable à ce plan' };
      }
    }

    const plan = await this.planModel.findById(planId).exec();
    if (!plan) {
      return { valid: false, message: 'Plan non trouvé' };
    }

    let discount = 0;
    if (promoCode.discountType === 'PERCENT') {
      discount = plan.price * (promoCode.value / 100);
    } else {
      discount = promoCode.value;
    }

    return {
      valid: true,
      discount,
      discountType: promoCode.discountType,
      value: promoCode.value,
      finalPrice:
        promoCode.discountType === 'PERCENT'
          ? plan.price * (1 - promoCode.value / 100)
          : Math.max(0, plan.price - promoCode.value),
    };
  }
}
