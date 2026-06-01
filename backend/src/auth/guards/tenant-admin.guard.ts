import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class TenantAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.role !== 'TENANT_ADMIN' && user.role !== 'PLATFORM_ADMIN') {
      throw new ForbiddenException('Only tenant administrators can access this resource');
    }

    return true;
  }
}
