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
var UserSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSyncService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
let UserSyncService = UserSyncService_1 = class UserSyncService {
    constructor(userModel) {
        this.userModel = userModel;
        this.logger = new common_1.Logger(UserSyncService_1.name);
    }
    async createUserFromEmployee(email, firstName, lastName, tenantId, role = 'CONSULTANT') {
        const existingUser = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
        if (existingUser) {
            this.logger.warn(`User already exists for email ${email}`);
            throw new common_1.BadRequestException(`Un utilisateur avec l'email ${email} existe déjà`);
        }
        const tempPassword = crypto.randomBytes(12).toString('hex');
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        const user = new this.userModel({
            name: `${firstName} ${lastName}`,
            email: email.toLowerCase(),
            password: hashedPassword,
            role,
            tenantId,
            isActive: true,
            isEmailVerified: false,
            metadata: {
                tempPassword,
                createdFrom: 'EMPLOYEE',
            },
        });
        await user.save();
        this.logger.log(`User created for employee ${email} with role ${role}`);
        return user;
    }
    async createUserFromIntervenant(email, firstName, lastName, tenantId) {
        return this.createUserFromEmployee(email, firstName, lastName, tenantId, 'CONSULTANT');
    }
    async updateUserFromEmployee(userId, firstName, lastName, email) {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            this.logger.warn(`User with ID ${userId} not found for update`);
            return null;
        }
        user.name = `${firstName} ${lastName}`;
        if (email && email.toLowerCase() !== user.email) {
            const existingUser = await this.userModel.findOne({ email: email.toLowerCase() }).exec();
            if (existingUser && existingUser._id.toString() !== userId) {
                throw new common_1.BadRequestException(`L'email ${email} est déjà utilisé par un autre utilisateur`);
            }
            user.email = email.toLowerCase();
        }
        await user.save();
        this.logger.log(`User ${userId} updated successfully`);
        return user;
    }
    async deactivateUserFromEmployee(userId) {
        await this.userModel.findByIdAndUpdate(userId, { isActive: false }).exec();
    }
    async activateUserFromEmployee(userId) {
        await this.userModel.findByIdAndUpdate(userId, { isActive: true }).exec();
    }
};
exports.UserSyncService = UserSyncService;
exports.UserSyncService = UserSyncService = UserSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UserSyncService);
//# sourceMappingURL=user-sync.service.js.map