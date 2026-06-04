"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const mongoose_1 = require("@nestjs/mongoose");
const cra_schema_1 = require("../facturation/schemas/cra.schema");
async function seed() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const craModel = app.get((0, mongoose_1.getModelToken)(cra_schema_1.Cra.name));
    const tenantId = '69b4961869b46a396233d96b';
    await craModel.deleteMany({ tenantId, status: 'VALIDATED' });
    await craModel.insertMany([
        {
            intervenantId: 'intervenant-1',
            intervenantName: 'Pierre Dupont',
            projectId: 'project-1',
            projectName: 'Refonte Site Web',
            date: new Date('2025-11-18'),
            hours: 7,
            rate: 500,
            amount: 3500,
            status: 'VALIDATED',
            tenantId,
        },
        {
            intervenantId: 'intervenant-2',
            intervenantName: 'Jean Moreau',
            projectId: 'project-2',
            projectName: 'Application Mobile CRM',
            date: new Date('2025-11-18'),
            hours: 8,
            rate: 550,
            amount: 4400,
            status: 'VALIDATED',
            tenantId,
        },
    ]);
    console.log('CRA seed done!');
    await app.close();
}
seed();
//# sourceMappingURL=seed-cra.js.map