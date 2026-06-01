"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentParserModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const document_parser_controller_1 = require("./document-parser.controller");
const universal_document_parser_service_1 = require("./services/universal-document-parser.service");
const parsing_template_schema_1 = require("./schemas/parsing-template.schema");
let DocumentParserModule = class DocumentParserModule {
};
exports.DocumentParserModule = DocumentParserModule;
exports.DocumentParserModule = DocumentParserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: parsing_template_schema_1.ParsingTemplate.name, schema: parsing_template_schema_1.ParsingTemplateSchema },
            ]),
        ],
        controllers: [document_parser_controller_1.DocumentParserController],
        providers: [universal_document_parser_service_1.UniversalDocumentParserService],
        exports: [universal_document_parser_service_1.UniversalDocumentParserService],
    })
], DocumentParserModule);
//# sourceMappingURL=document-parser.module.js.map