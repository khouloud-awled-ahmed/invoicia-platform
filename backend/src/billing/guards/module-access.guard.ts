import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from '../../tenants/schemas/tenant.schema';

@Injectable()
export class ModuleAccessGuard implements CanActivate {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Les PLATFORM_ADMIN ont accès à tout
    if (user?.role === 'PLATFORM_ADMIN') {
      return true;
    }

    // Si pas de tenantId et pas PLATFORM_ADMIN, refuser
    if (!user?.tenantId && user?.role !== 'PLATFORM_ADMIN') {
      throw new ForbiddenException('Tenant ID is required');
    }

    // Récupérer le tenant
    const tenant = await this.tenantModel.findById(user.tenantId).exec();
    if (!tenant) {
      throw new ForbiddenException('Tenant not found');
    }

    // Vérifier le statut de l'abonnement
    if (tenant.subscriptionStatus === 'SUSPENDED' || tenant.subscriptionStatus === 'CANCELLED') {
      throw new ForbiddenException('Subscription is suspended or cancelled');
    }

    // Déterminer le module requis selon la route
    const path = request.url;
    let requiredModule: string | null = null;

    if (path.includes('/billing/sales/')) {
      requiredModule = 'SALES';
    } else if (path.includes('/billing/purchases/')) {
      requiredModule = 'PURCHASES';
    } else if (path.includes('/projects')) {
      requiredModule = 'PROJECTS';
    } else if (path.includes('/employees') || path.includes('/hr')) {
      requiredModule = 'HR';
    } else if (path.includes('/accounting')) {
      requiredModule = 'ACCOUNTING';
    }

    // Si un module est requis et qu'il n'est pas activé, refuser
    if (requiredModule && (!tenant.modules || !tenant.modules.includes(requiredModule))) {
      throw new ForbiddenException(`Module ${requiredModule} is not activated for this tenant`);
    }

    return true;
  }
}
