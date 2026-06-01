"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GEDModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const ged_controller_1 = require("./ged.controller");
const ged_service_1 = require("./ged.service");
const ged_folder_schema_1 = require("./schemas/ged-folder.schema");
const ged_document_schema_1 = require("./schemas/ged-document.schema");
const ged_classification_rule_schema_1 = require("./schemas/ged-classification-rule.schema");
const attachments_module_1 = require("../attachments/attachments.module");
const ged_initialization_service_1 = require("./ged-initialization.service");
let GEDModule = class GEDModule {
};
exports.GEDModule = GEDModule;
exports.GEDModule = GEDModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: ged_folder_schema_1.GEDFolder.name, schema: ged_folder_schema_1.GEDFolderSchema },
                { name: ged_document_schema_1.GEDDocument.name, schema: ged_document_schema_1.GEDDocumentSchema },
                { name: ged_classification_rule_schema_1.GEDClassificationRule.name, schema: ged_classification_rule_schema_1.GEDClassificationRuleSchema },
            ]),
            attachments_module_1.AttachmentsModule,
        ],
        controllers: [ged_controller_1.GEDController],
        providers: [ged_service_1.GEDService, ged_initialization_service_1.GEDInitializationService],
        exports: [ged_service_1.GEDService, ged_initialization_service_1.GEDInitializationService],
    })
], GEDModule);
//# sourceMappingURL=ged.module.js.map