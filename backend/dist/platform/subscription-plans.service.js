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
exports.SubscriptionPlansService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const subscription_plan_schema_1 = require("./schemas/subscription-plan.schema");
let SubscriptionPlansService = class SubscriptionPlansService {
    constructor(planModel) {
        this.planModel = planModel;
    }
    async create(createPlanDto) {
        const existing = await this.planModel.findOne({ name: createPlanDto.name }).exec();
        if (existing) {
            throw new common_1.BadRequestException(`Un plan avec le nom "${createPlanDto.name}" existe déjà`);
        }
        const plan = new this.planModel({
            ...createPlanDto,
            currency: createPlanDto.currency || 'EUR',
            maxUsers: createPlanDto.maxUsers || 10,
            isActive: createPlanDto.isActive !== undefined ? createPlanDto.isActive : true,
        });
        return plan.save();
    }
    async findAll() {
        return this.planModel.find().sort({ price: 1 }).exec();
    }
    async findActive() {
        return this.planModel.find({ isActive: true }).sort({ price: 1 }).exec();
    }
    async findOne(id) {
        const plan = await this.planModel.findById(id).exec();
        if (!plan) {
            throw new common_1.NotFoundException(`Plan with ID ${id} not found`);
        }
        return plan;
    }
    async update(id, updatePlanDto) {
        const plan = await this.planModel.findByIdAndUpdate(id, updatePlanDto, { new: true }).exec();
        if (!plan) {
            throw new common_1.NotFoundException(`Plan with ID ${id} not found`);
        }
        return plan;
    }
    async remove(id) {
        const result = await this.planModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new common_1.NotFoundException(`Plan with ID ${id} not found`);
        }
    }
};
exports.SubscriptionPlansService = SubscriptionPlansService;
exports.SubscriptionPlansService = SubscriptionPlansService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(subscription_plan_schema_1.SubscriptionPlan.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SubscriptionPlansService);
//# sourceMappingURL=subscription-plans.service.js.map