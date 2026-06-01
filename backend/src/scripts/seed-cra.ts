import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Cra } from '../facturation/schemas/cra.schema';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const craModel = app.get(getModelToken(Cra.name));

  // Replace with your real tenantId from the logs
  const tenantId = '69b4961869b46a396233d96b';

  await craModel.deleteMany({ tenantId, status: 'VALIDATED' });

  await craModel.insertMany([
    {
      intervenantId: 'intervenant-1',
      intervenantName: 'Pierre Dupont',
      projectId: 'project-1',
      projectName: 'Refonte Site Web',
      date: new Date('2025-11-18'),
      hours: 7, rate: 500, amount: 3500,
      status: 'VALIDATED', tenantId,
    },
    {
      intervenantId: 'intervenant-2',
      intervenantName: 'Jean Moreau',
      projectId: 'project-2',
      projectName: 'Application Mobile CRM',
      date: new Date('2025-11-18'),
      hours: 8, rate: 550, amount: 4400,
      status: 'VALIDATED', tenantId,
    },
  ]);

  console.log('CRA seed done!');
  await app.close();
}
seed();