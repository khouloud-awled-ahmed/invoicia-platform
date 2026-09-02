import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Cra } from '../facturation/schemas/cra.schema';
import { Tenant } from '../tenants/schemas/tenant.schema';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const craModel = app.get(getModelToken(Cra.name));
  const tenantModel = app.get(getModelToken(Tenant.name));

  let tenantId = process.env.TENANT_ID;
  if (!tenantId) {
    const tenant = await tenantModel.findOne().exec();
    if (!tenant) {
      console.error('No tenant found in database. Create a tenant first, or set TENANT_ID env var.');
      await app.close();
      return;
    }
    tenantId = tenant._id.toString();
    console.log(`No TENANT_ID given — using first tenant found: ${tenant.name} (${tenantId})`);
  }

  await craModel.deleteMany({ tenantId, status: 'VALIDATED' });

  await craModel.insertMany([
    {
      intervenantId: 'intervenant-1',
      intervenantName: 'Pierre Dupont',
      projectId: 'project-1',
      projectName: 'Refonte Site Web',
      date: new Date('2026-08-18'),
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
      date: new Date('2026-08-18'),
      hours: 8,
      rate: 550,
      amount: 4400,
      status: 'VALIDATED',
      tenantId,
    },
    {
      intervenantId: 'intervenant-3',
      intervenantName: 'Sarra Ben Salah',
      projectId: 'project-3',
      projectName: 'Migration Cloud AWS',
      date: new Date('2026-08-20'),
      hours: 6,
      rate: 480,
      amount: 2880,
      status: 'VALIDATED',
      tenantId,
    },
  ]);

  console.log('CRA seed done!');
  await app.close();
}
seed();
