import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TechnicalAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    // Seuls les utilisateurs avec le rôle 'technical_admin' ou 'super_admin' peuvent accéder
    const allowedRoles = ['technical_admin', 'super_admin'];
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException('Technical administrator access required');
    }

    return true;
  }
}
