"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EcrituresModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const ecritures_controller_1 = require("./ecritures.controller");
const ecritures_service_1 = require("./ecritures.service");
const ecriture_schema_1 = require("./schemas/ecriture.schema");
let EcrituresModule = class EcrituresModule {
};
exports.EcrituresModule = EcrituresModule;
exports.EcrituresModule = EcrituresModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: ecriture_schema_1.Ecriture.name, schema: ecriture_schema_1.EcritureSchema }])],
        controllers: [ecritures_controller_1.EcrituresController],
        providers: [ecritures_service_1.EcrituresService],
    })
], EcrituresModule);
//# sourceMappingURL=ecritures.module.js.map