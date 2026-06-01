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
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const webhook_schema_1 = require("./webhook.schema");
let WebhooksService = class WebhooksService {
    constructor(webhookModel) {
        this.webhookModel = webhookModel;
    }
    async findAll(tenantId) {
        const docs = await this.webhookModel.find({ tenantId }).lean();
        return docs.map(d => ({ ...d, id: d._id?.toString() }));
    }
    async create(tenantId, dto) {
        const secret = Math.random().toString(36).substring(2, 15);
        const webhook = new this.webhookModel({ ...dto, tenantId, secret });
        return webhook.save();
    }
    async update(id, tenantId, dto) {
        return this.webhookModel.findOneAndUpdate({ _id: id, tenantId }, dto, { new: true });
    }
    async remove(id, tenantId) {
        return this.webhookModel.findOneAndDelete({ _id: id, tenantId });
    }
};
exports.WebhooksService = WebhooksService;
exports.WebhooksService = WebhooksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(webhook_schema_1.Webhook.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map