/**
 * Script de seeding de la base de données
 *
 * Usage:
 *   npm run seed
 *   ou
 *   ts-node src/scripts/seed-database.ts
 *
 * Ce script crée les utilisateurs initiaux si ils n'existent pas :
 * - Super Admin (admin@invocia.io)
 * - Client Test (client@test.com)
 */

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Tenant, TenantDocument } from '../tenants/schemas/tenant.schema';

async function seedDatabase() {
  console.log('🌱 Démarrage du seeding de la base de données...\n');

  const app = await NestFactory.createApplicationContext(AppModule);

  const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
  const tenantModel = app.get<Model<TenantDocument>>(getModelToken(Tenant.name));

  try {
    // ==================== SUPER ADMIN ====================
    console.log('📝 Vérification du Super Admin...');
    const adminEmail = 'admin@invocia.io';
    const adminPassword = 'admin123';

    let adminUser = await userModel.findOne({ email: adminEmail }).exec();

    if (!adminUser) {
      console.log('   → Création du Super Admin...');
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);

      adminUser = new userModel({
        name: 'Super Admin',
        email: adminEmail,
        password: hashedAdminPassword,
        role: 'PLATFORM_ADMIN',
        tenantId: null, // Super Admin n'a pas de tenant
        isActive: true,
        emailVerified: true,
      });

      await adminUser.save();
      console.log('   ✅ Super Admin créé avec succès');
      console.log(`      Email: ${adminEmail}`);
      console.log(`      Password: ${adminPassword}`);
    } else {
      console.log('   ℹ️  Super Admin existe déjà');
    }

    // ==================== CLIENT TEST (TENANT) ====================
    console.log('\n📝 Vérification du Client Test...');
    const clientEmail = 'client@test.com';
    const clientPassword = 'client123';
    const companyName = 'Entreprise Test SAS';

    // Vérifier si le tenant existe
    let testTenant = await tenantModel
      .findOne({
        $or: [{ name: companyName }, { businessName: companyName }, { adminEmail: clientEmail }],
      })
      .exec();

    if (!testTenant) {
      console.log('   → Création du Tenant "Entreprise Test SAS"...');
      testTenant = new tenantModel({
        name: companyName,
        businessName: companyName,
        matriculeFiscal: '1234567/A/B/M/000',
        adminEmail: clientEmail,
        email: clientEmail,
        status: 'active',
        subscriptionPlan: 'essential',
        pack: 'essential',
        modules: ['billing', 'hr', 'accounting', 'banking'],
        subscriptionStatus: 'ACTIVE',
        planType: 'STARTER',
        currentUsers: 0,
        maxUsers: 10,
        settings: {
          paymentMethods: [],
        },
      });

      await testTenant.save();
      console.log('   ✅ Tenant créé avec succès');
      console.log(`      Nom: ${companyName}`);
    } else {
      console.log('   ℹ️  Tenant existe déjà');
    }

    // Vérifier si l'utilisateur client existe
    let clientUser = await userModel.findOne({ email: clientEmail }).exec();

    if (!clientUser) {
      console.log("   → Création de l'utilisateur Client Test...");
      const hashedClientPassword = await bcrypt.hash(clientPassword, 10);

      clientUser = new userModel({
        name: 'Client Test',
        email: clientEmail,
        password: hashedClientPassword,
        role: 'TENANT_ADMIN',
        tenantId: testTenant._id.toString(),
        isActive: true,
        emailVerified: true,
      });

      await clientUser.save();

      // Mettre à jour le compteur d'utilisateurs du tenant
      await tenantModel.updateOne({ _id: testTenant._id }, { $inc: { currentUsers: 1 } }).exec();

      console.log('   ✅ Utilisateur Client Test créé avec succès');
      console.log(`      Email: ${clientEmail}`);
      console.log(`      Password: ${clientPassword}`);
      console.log(`      Tenant: ${companyName}`);
    } else {
      // Corriger le rôle si ancien (COMPANY_ADMIN → TENANT_ADMIN pour accès frontend)
      if ((clientUser as any).role === 'COMPANY_ADMIN') {
        await userModel.updateOne({ email: clientEmail }, { role: 'TENANT_ADMIN' }).exec();
        console.log('   🔄 Rôle Client Test mis à jour: COMPANY_ADMIN → TENANT_ADMIN');
      } else {
        console.log('   ℹ️  Utilisateur Client Test existe déjà');
      }
    }

    console.log('\n✅ Seeding terminé avec succès !\n');
    console.log('📋 Récapitulatif des comptes :');
    console.log('   Super Admin:');
    console.log(`     - Email: ${adminEmail}`);
    console.log(`     - Password: ${adminPassword}`);
    console.log(`     - Role: PLATFORM_ADMIN\n`);
    console.log('   Client Test:');
    console.log(`     - Email: ${clientEmail}`);
    console.log(`     - Password: ${clientPassword}`);
    console.log(`     - Role: TENANT_ADMIN`);
    console.log(`     - Company: ${companyName}\n`);
  } catch (error) {
    console.error('❌ Erreur lors du seeding:', error);
    throw error;
  } finally {
    await app.close();
  }
}

// Exécuter le script
seedDatabase()
  .then(() => {
    console.log('🎉 Script terminé');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
