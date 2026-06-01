"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecrutementModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const recrutement_controller_1 = require("./recrutement.controller");
const recrutement_service_1 = require("./recrutement.service");
const offre_schema_1 = require("./schemas/offre.schema");
let RecrutementModule = class RecrutementModule {
};
exports.RecrutementModule = RecrutementModule;
exports.RecrutementModule = RecrutementModule = __decorate([
    (0, common_1.Module)({
        imports: [mongoose_1.MongooseModule.forFeature([{ name: offre_schema_1.Offre.name, schema: offre_schema_1.OffreSchema }])],
        controllers: [recrutement_controller_1.RecrutementController],
        providers: [recrutement_service_1.RecrutementService],
    })
], RecrutementModule);
//# sourceMappingURL=recrutement.module.js.map