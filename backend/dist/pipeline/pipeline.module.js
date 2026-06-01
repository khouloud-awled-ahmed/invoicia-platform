"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const pipeline_controller_1 = require("./pipeline.controller");
const pipeline_service_1 = require("./pipeline.service");
const opportunity_schema_1 = require("./opportunity.schema");
let PipelineModule = class PipelineModule {
};
exports.PipelineModule = PipelineModule;
exports.PipelineModule = PipelineModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: opportunity_schema_1.Opportunity.name, schema: opportunity_schema_1.OpportunitySchema },
            ]),
        ],
        controllers: [pipeline_controller_1.PipelineController],
        providers: [pipeline_service_1.PipelineService],
    })
], PipelineModule);
//# sourceMappingURL=pipeline.module.js.map