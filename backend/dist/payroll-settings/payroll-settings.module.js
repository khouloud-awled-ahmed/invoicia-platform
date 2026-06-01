"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayrollSettingsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const payroll_settings_service_1 = require("./payroll-settings.service");
const dsn_generator_service_1 = require("./dsn-generator.service");
const payroll_settings_controller_1 = require("./payroll-settings.controller");
const social_org_schema_1 = require("./schemas/social-org.schema");
const tenant_schema_1 = require("../tenants/schemas/tenant.schema");
const employee_schema_1 = require("../employees/schemas/employee.schema");
let PayrollSettingsModule = class PayrollSettingsModule {
};
exports.PayrollSettingsModule = PayrollSettingsModule;
exports.PayrollSettingsModule = PayrollSettingsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: social_org_schema_1.SocialOrg.name, schema: social_org_schema_1.SocialOrgSchema },
                { name: tenant_schema_1.Tenant.name, schema: tenant_schema_1.TenantSchema },
                { name: employee_schema_1.Employee.name, schema: employee_schema_1.EmployeeSchema },
            ]),
        ],
        controllers: [payroll_settings_controller_1.PayrollSettingsController],
        providers: [payroll_settings_service_1.PayrollSettingsService, dsn_generator_service_1.DSNGeneratorService],
        exports: [payroll_settings_service_1.PayrollSettingsService, dsn_generator_service_1.DSNGeneratorService],
    })
], PayrollSettingsModule);
//# sourceMappingURL=payroll-settings.module.js.map