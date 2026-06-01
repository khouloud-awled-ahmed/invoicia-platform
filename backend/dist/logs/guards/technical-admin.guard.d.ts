import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class TechnicalAdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
