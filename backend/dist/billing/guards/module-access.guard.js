"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleAccessGuard = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const tenant_schema_1 = require("../../tenants/schemas/tenant.schema");
let ModuleAccessGuard = class ModuleAccessGuard {
    constructor(tenantModel) {
        this.tenantModel = tenantModel;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (user?.role === 'PLATFORM_ADMIN') {
            return true;
        }
        if (!user?.tenantId && user?.role !== 'PLATFORM_ADMIN') {
            throw new common_1.ForbiddenException('Tenant ID is required');
        }
        const tenant = await this.tenantModel.findById(user.tenantId).exec();
        if (!tenant) {
            throw new common_1.ForbiddenException('Tenant not found');
        }
        if (tenant.subscriptionStatus === 'SUSPENDED' || tenant.subscriptionStatus === 'CANCELLED') {
            throw new common_1.ForbiddenException('Subscription is suspended or cancelled');
        }
        const path = request.url;
        let requiredModule = null;
        if (path.includes('/billing/sales/')) {
            requiredModule = 'SALES';
        }
        else if (path.includes('/billing/purchases/')) {
            requiredModule = 'PURCHASES';
        }
        else if (path.includes('/projects')) {
            requiredModule = 'PROJECTS';
        }
        else if (path.includes('/employees') || path.includes('/hr')) {
            requiredModule = 'HR';
        }
        else if (path.includes('/accounting')) {
            requiredModule = 'ACCOUNTING';
        }
        if (requiredModule && (!tenant.modules || !tenant.modules.includes(requiredModule))) {
            throw new common_1.ForbiddenException(`Module ${requiredModule} is not activated for this tenant`);
        }
        return true;
    }
};
exports.ModuleAccessGuard = ModuleAccessGuard;
exports.ModuleAccessGuard = ModuleAccessGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(tenant_schema_1.Tenant.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ModuleAccessGuard);
//# sourceMappingURL=module-access.guard.js.map