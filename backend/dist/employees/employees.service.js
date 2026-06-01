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
var EmployeesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const employee_schema_1 = require("./schemas/employee.schema");
const cv_schema_1 = require("./schemas/cv.schema");
const user_sync_service_1 = require("../users/user-sync.service");
let EmployeesService = EmployeesService_1 = class EmployeesService {
    constructor(employeeModel, cvModel, userSyncService) {
        this.employeeModel = employeeModel;
        this.cvModel = cvModel;
        this.userSyncService = userSyncService;
        this.logger = new common_1.Logger(EmployeesService_1.name);
    }
    async create(createDto, tenantId) {
        const employee = new this.employeeModel({
            ...createDto,
            tenantId,
            email: createDto.email?.toLowerCase(),
        });
        const savedEmployee = await employee.save();
        try {
            const role = createDto.role || 'CONSULTANT';
            const user = await this.userSyncService.createUserFromEmployee(savedEmployee.email, savedEmployee.firstName, savedEmployee.lastName, tenantId, role);
            savedEmployee.userId = user._id.toString();
            await savedEmployee.save();
        }
        catch (error) {
            await this.employeeModel.findByIdAndDelete(savedEmployee._id).exec();
            this.logger.error('Erreur lors de la création automatique du User:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
            throw new common_1.BadRequestException(`Impossible de créer le compte utilisateur: ${errorMessage}`);
        }
        return savedEmployee;
    }
    async findAll(tenantId) {
        return this.employeeModel.find({ tenantId }).exec();
    }
    async findOne(id, tenantId) {
        const employee = await this.employeeModel.findOne({ _id: id, tenantId }).exec();
        if (!employee) {
            throw new common_1.NotFoundException(`Employee with ID ${id} not found`);
        }
        return employee;
    }
    async update(id, updateDto, tenantId) {
        const employee = await this.findOne(id, tenantId);
        const updated = await this.employeeModel
            .findOneAndUpdate({ _id: id, tenantId }, updateDto, { new: true })
            .exec();
        if (!updated) {
            throw new common_1.NotFoundException(`Employee with ID ${id} not found`);
        }
        if (employee.userId && (updateDto.firstName || updateDto.lastName || updateDto.email)) {
            try {
                await this.userSyncService.updateUserFromEmployee(employee.userId, updated.firstName, updated.lastName, updateDto.email);
            }
            catch (error) {
                this.logger.error('Erreur lors de la mise à jour du User:', error);
            }
        }
        if (updateDto.status !== undefined && employee.userId) {
            if (updateDto.status === 'active') {
                await this.userSyncService.activateUserFromEmployee(employee.userId);
            }
            else if (updateDto.status === 'inactive') {
                await this.userSyncService.deactivateUserFromEmployee(employee.userId);
            }
        }
        return updated;
    }
    async remove(id, tenantId) {
        const result = await this.employeeModel.findOneAndDelete({ _id: id, tenantId }).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Employee with ID ${id} not found`);
        }
    }
    async createCV(tenantId, data) {
        const cv = new this.cvModel({ ...data, tenantId });
        return cv.save();
    }
    async findAllCVs(tenantId) {
        return this.cvModel.find({ tenantId }).sort({ createdAt: -1 }).exec();
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = EmployeesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(employee_schema_1.Employee.name)),
    __param(1, (0, mongoose_1.InjectModel)(cv_schema_1.CV.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        user_sync_service_1.UserSyncService])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map