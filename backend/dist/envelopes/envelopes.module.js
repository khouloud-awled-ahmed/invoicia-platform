"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnvelopesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const envelopes_controller_1 = require("./envelopes.controller");
const envelopes_service_1 = require("./envelopes.service");
const envelope_schema_1 = require("./schemas/envelope.schema");
const workflow_engine_service_1 = require("./workflow-engine.service");
const email_service_1 = require("./email.service");
const certificate_service_1 = require("./certificate.service");
let EnvelopesModule = class EnvelopesModule {
};
exports.EnvelopesModule = EnvelopesModule;
exports.EnvelopesModule = EnvelopesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: envelope_schema_1.Envelope.name, schema: envelope_schema_1.EnvelopeSchema }]),
        ],
        controllers: [envelopes_controller_1.EnvelopesController],
        providers: [envelopes_service_1.EnvelopesService, workflow_engine_service_1.WorkflowEngine, email_service_1.EmailService, certificate_service_1.CertificateService],
        exports: [envelopes_service_1.EnvelopesService],
    })
], EnvelopesModule);
//# sourceMappingURL=envelopes.module.js.map