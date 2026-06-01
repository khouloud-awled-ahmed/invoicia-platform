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
var DSNGeneratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DSNGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const tenant_schema_1 = require("../tenants/schemas/tenant.schema");
const social_org_schema_1 = require("./schemas/social-org.schema");
const employee_schema_1 = require("../employees/schemas/employee.schema");
let DSNGeneratorService = DSNGeneratorService_1 = class DSNGeneratorService {
    constructor(tenantModel, socialOrgModel, employeeModel) {
        this.tenantModel = tenantModel;
        this.socialOrgModel = socialOrgModel;
        this.employeeModel = employeeModel;
        this.logger = new common_1.Logger(DSNGeneratorService_1.name);
    }
    async generateMonthlyDSN(tenantId, month, year) {
        const tenant = await this.tenantModel.findById(tenantId).exec();
        if (!tenant) {
            throw new common_1.NotFoundException(`Tenant with ID ${tenantId} not found`);
        }
        const payrollSettings = tenant.payrollSettings || {};
        const identifier = payrollSettings.matriculeFiscal || tenant.matriculeFiscal;
        if (!identifier) {
            throw new common_1.NotFoundException('Les paramètres de paie ne sont pas configurés (Matricule Fiscal manquant)');
        }
        const employees = await this.employeeModel
            .find({ tenantId, status: 'active' })
            .exec();
        const socialOrgs = await this.socialOrgModel.find({ tenantId }).exec();
        const lines = [];
        lines.push(this.generateBlock00(payrollSettings, month, year));
        lines.push(this.generateBlock05(month, year));
        lines.push(this.generateBlock11(tenant, payrollSettings));
        for (const employee of employees) {
            lines.push(this.generateBlock30(employee));
            lines.push(this.generateBlock40(employee));
            for (const socialOrg of socialOrgs) {
                lines.push(this.generateBlock70(employee, socialOrg));
            }
        }
        return lines.join('\r\n') + '\r\n';
    }
    generateBlock00(payrollSettings, month, year) {
        const dsnSenderId = payrollSettings.dsnSenderId || 'DSN-SENDER-001';
        const dateEnvoi = this.formatDateDDMMYYYY(new Date());
        const heureEnvoi = this.formatTimeHHMMSS(new Date());
        return `00|${this.padRight(dsnSenderId, 20)}|${dateEnvoi}|${heureEnvoi}|01|V01`;
    }
    generateBlock05(month, year) {
        const typeDeclaration = '01';
        const mois = month.padStart(2, '0');
        const annee = year;
        return `05|${typeDeclaration}|${mois}|${annee}|01|01`;
    }
    generateBlock11(tenant, payrollSettings) {
        const mf = (payrollSettings.matriculeFiscal || tenant.matriculeFiscal || '').replace(/\s/g, '');
        const siretCompat = mf.padEnd(14, ' ').substring(0, 14);
        const nic = (payrollSettings.nic || '').padStart(5, '0');
        const apeCode = (payrollSettings.apeCode || '').padEnd(5, ' ');
        const cnssId = (payrollSettings.affiliationCNSS || '').padEnd(20, ' ');
        const raisonSociale = (tenant.businessName || tenant.name || '').substring(0, 50).padEnd(50, ' ');
        return `11|${siretCompat}|${nic}|${apeCode}|${cnssId}|${raisonSociale}`;
    }
    generateBlock30(employee) {
        const nir = '0'.padStart(15, '0');
        const nom = (employee.lastName || '').toUpperCase().substring(0, 38).padEnd(38, ' ');
        const prenom = (employee.firstName || '').substring(0, 38).padEnd(38, ' ');
        const dateNaissance = employee.birthDate
            ? this.formatDateDDMMYYYY(employee.birthDate)
            : '00000000';
        return `30|${nir}|${nom}|${prenom}|${dateNaissance}|1`;
    }
    generateBlock40(employee) {
        const numeroContrat = (employee._id?.toString() || '').substring(0, 10).padEnd(10, ' ');
        const typeContrat = '01';
        const dateDebut = employee.hireDate
            ? this.formatDateDDMMYYYY(employee.hireDate)
            : this.formatDateDDMMYYYY(new Date());
        const dateFin = '00000000';
        return `40|${numeroContrat}|${typeContrat}|${dateDebut}|${dateFin}|0000`;
    }
    generateBlock70(employee, socialOrg) {
        const numeroContrat = (employee._id?.toString() || '').substring(0, 10).padEnd(10, ' ');
        const codeOrganisme = (socialOrg.contractId || socialOrg.name.substring(0, 5).toUpperCase()).padEnd(5, ' ');
        const numeroAffiliation = (socialOrg.affiliationId || '').padEnd(20, ' ');
        let typeAffiliation = '01';
        const orgName = (socialOrg.name || '').toUpperCase();
        if (orgName.includes('PREVOYANCE') || orgName.includes('PREV')) {
            typeAffiliation = '02';
        }
        else if (orgName.includes('RETRAITE') || orgName.includes('RET')) {
            typeAffiliation = '03';
        }
        const dateEffet = employee.hireDate
            ? this.formatDateDDMMYYYY(employee.hireDate)
            : this.formatDateDDMMYYYY(new Date());
        return `70|${numeroContrat}|${codeOrganisme}|${numeroAffiliation}|${typeAffiliation}|${dateEffet}`;
    }
    formatDateDDMMYYYY(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear());
        return `${day}${month}${year}`;
    }
    formatTimeHHMMSS(date) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${hours}${minutes}${seconds}`;
    }
    padRight(str, length) {
        return (str || '').substring(0, length).padEnd(length, ' ');
    }
};
exports.DSNGeneratorService = DSNGeneratorService;
exports.DSNGeneratorService = DSNGeneratorService = DSNGeneratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(tenant_schema_1.Tenant.name)),
    __param(1, (0, mongoose_1.InjectModel)(social_org_schema_1.SocialOrg.name)),
    __param(2, (0, mongoose_1.InjectModel)(employee_schema_1.Employee.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], DSNGeneratorService);
//# sourceMappingURL=dsn-generator.service.js.map