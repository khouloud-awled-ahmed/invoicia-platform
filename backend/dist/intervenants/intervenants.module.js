"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntervenantsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const intervenants_service_1 = require("./intervenants.service");
const intervenants_controller_1 = require("./intervenants.controller");
const intervenant_schema_1 = require("./schemas/intervenant.schema");
const users_module_1 = require("../users/users.module");
let IntervenantsModule = class IntervenantsModule {
};
exports.IntervenantsModule = IntervenantsModule;
exports.IntervenantsModule = IntervenantsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: intervenant_schema_1.Intervenant.name, schema: intervenant_schema_1.IntervenantSchema },
            ]),
            users_module_1.UsersModule,
        ],
        controllers: [intervenants_controller_1.IntervenantsController],
        providers: [intervenants_service_1.IntervenantsService],
        exports: [intervenants_service_1.IntervenantsService],
    })
], IntervenantsModule);
//# sourceMappingURL=intervenants.module.js.map