"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantAdminGuard = void 0;
const common_1 = require("@nestjs/common");
let TenantAdminGuard = class TenantAdminGuard {
    canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        if (user.role !== 'TENANT_ADMIN' && user.role !== 'PLATFORM_ADMIN') {
            throw new common_1.ForbiddenException('Only tenant administrators can access this resource');
        }
        return true;
    }
};
exports.TenantAdminGuard = TenantAdminGuard;
exports.TenantAdminGuard = TenantAdminGuard = __decorate([
    (0, common_1.Injectable)()
], TenantAdminGuard);
//# sourceMappingURL=tenant-admin.guard.js.map