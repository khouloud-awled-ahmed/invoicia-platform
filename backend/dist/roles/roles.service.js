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
exports.RolesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const role_schema_1 = require("./role.schema");
let RolesService = class RolesService {
    constructor(roleModel) {
        this.roleModel = roleModel;
    }
    async findAll(tenantId) {
        return this.roleModel.find({ tenantId }).exec();
    }
    async findBySlug(tenantId, slug) {
        return this.roleModel.findOne({ tenantId, slug }).exec();
    }
    async create(tenantId, data) {
        const role = new this.roleModel({ ...data, tenantId });
        return role.save();
    }
    async update(id, tenantId, data) {
        const role = await this.roleModel.findOneAndUpdate({ _id: id, tenantId }, data, { new: true }).exec();
        if (!role)
            throw new common_1.NotFoundException('Role not found');
        return role;
    }
    async delete(id, tenantId) {
        await this.roleModel.findOneAndDelete({ _id: id, tenantId }).exec();
    }
    async seedDefaultRoles(tenantId) {
        const existing = await this.roleModel.countDocuments({ tenantId }).exec();
        if (existing > 0)
            return;
        const defaults = [
            {
                name: 'Super Admin', slug: 'super_admin', level: 1, isSystem: true, color: '#9333ea',
                permissions: [
                    { module: 'dashboard', actions: { view: true, create: true, edit: true, delete: true } },
                    { module: 'clients', actions: { view: true, create: true, edit: true, delete: true } },
                    { module: 'settings', actions: { view: true, create: true, edit: true, delete: true } },
                    { module: 'users', actions: { view: true, create: true, edit: true, delete: true } },
                ]
            },
            {
                name: 'Admin Plateforme', slug: 'platform_admin', level: 2, isSystem: true, color: '#6366f1',
                permissions: ['dashboard', 'sales', 'purchases', 'accounting', 'banking', 'hr', 'payroll',
                    'projects', 'clients', 'contracts', 'ged', 'signature', 'crm', 'reporting', 'settings', 'users'
                ].map(m => ({ module: m, actions: { view: true, create: true, edit: true, delete: true, validate: true, export: true } }))
            },
            {
                name: 'Directeur / CEO', slug: 'ceo', level: 3, isSystem: false, color: '#dc2626',
                permissions: [
                    { module: 'dashboard', actions: { view: true, create: false, edit: false, delete: false } },
                    { module: 'reporting', actions: { view: true, create: false, edit: false, delete: false, export: true } },
                    { module: 'accounting', actions: { view: true, create: false, edit: false, delete: false, export: true } },
                    { module: 'hr', actions: { view: true, create: false, edit: false, delete: false } },
                    { module: 'projects', actions: { view: true, create: false, edit: false, delete: false } },
                    { module: 'clients', actions: { view: true, create: false, edit: false, delete: false } },
                ]
            },
            {
                name: 'Comptable', slug: 'accountant', level: 5, isSystem: false, color: '#0891b2',
                permissions: [
                    { module: 'dashboard', actions: { view: true, create: false, edit: false, delete: false } },
                    { module: 'accounting', actions: { view: true, create: true, edit: true, delete: false, export: true } },
                    { module: 'banking', actions: { view: true, create: true, edit: true, delete: false } },
                    { module: 'sales', actions: { view: true, create: true, edit: true, delete: false } },
                    { module: 'purchases', actions: { view: true, create: true, edit: true, delete: false } },
                    { module: 'ged', actions: { view: true, create: true, edit: false, delete: false } },
                ]
            },
            {
                name: 'Responsable RH', slug: 'hr_manager', level: 4, isSystem: false, color: '#ea580c',
                permissions: [
                    { module: 'dashboard', actions: { view: true, create: false, edit: false, delete: false } },
                    { module: 'hr', actions: { view: true, create: true, edit: true, delete: true, validate: true } },
                    { module: 'users', actions: { view: true, create: true, edit: true, delete: false } },
                    { module: 'ged', actions: { view: true, create: true, edit: true, delete: false } },
                ]
            },
            {
                name: 'Responsable Commercial', slug: 'sales_manager', level: 4, isSystem: false, color: '#7c3aed',
                permissions: [
                    { module: 'dashboard', actions: { view: true, create: false, edit: false, delete: false } },
                    { module: 'sales', actions: { view: true, create: true, edit: true, delete: false, validate: true } },
                    { module: 'clients', actions: { view: true, create: true, edit: true, delete: false } },
                    { module: 'crm', actions: { view: true, create: true, edit: true, delete: true } },
                    { module: 'projects', actions: { view: true, create: true, edit: true, delete: false } },
                ]
            },
        ];
        for (const role of defaults) {
            await this.create(tenantId, role);
        }
    }
};
exports.RolesService = RolesService;
exports.RolesService = RolesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(role_schema_1.Role.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], RolesService);
//# sourceMappingURL=roles.service.js.map