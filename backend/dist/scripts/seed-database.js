"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../app.module");
const mongoose_1 = require("@nestjs/mongoose");
const bcrypt = require("bcrypt");
const user_schema_1 = require("../users/schemas/user.schema");
const tenant_schema_1 = require("../tenants/schemas/tenant.schema");
async function seedDatabase() {
    console.log('🌱 Démarrage du seeding de la base de données...\n');
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const userModel = app.get((0, mongoose_1.getModelToken)(user_schema_1.User.name));
    const tenantModel = app.get((0, mongoose_1.getModelToken)(tenant_schema_1.Tenant.name));
    try {
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
                tenantId: null,
                isActive: true,
                emailVerified: true,
            });
            await adminUser.save();
            console.log('   ✅ Super Admin créé avec succès');
            console.log(`      Email: ${adminEmail}`);
            console.log(`      Password: ${adminPassword}`);
        }
        else {
            console.log('   ℹ️  Super Admin existe déjà');
        }
        console.log('\n📝 Vérification du Client Test...');
        const clientEmail = 'client@test.com';
        const clientPassword = 'client123';
        const companyName = 'Entreprise Test SAS';
        let testTenant = await tenantModel.findOne({
            $or: [
                { name: companyName },
                { businessName: companyName },
                { adminEmail: clientEmail }
            ]
        }).exec();
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
        }
        else {
            console.log('   ℹ️  Tenant existe déjà');
        }
        let clientUser = await userModel.findOne({ email: clientEmail }).exec();
        if (!clientUser) {
            console.log('   → Création de l\'utilisateur Client Test...');
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
            await tenantModel.updateOne({ _id: testTenant._id }, { $inc: { currentUsers: 1 } }).exec();
            console.log('   ✅ Utilisateur Client Test créé avec succès');
            console.log(`      Email: ${clientEmail}`);
            console.log(`      Password: ${clientPassword}`);
            console.log(`      Tenant: ${companyName}`);
        }
        else {
            if (clientUser.role === 'COMPANY_ADMIN') {
                await userModel.updateOne({ email: clientEmail }, { role: 'TENANT_ADMIN' }).exec();
                console.log('   🔄 Rôle Client Test mis à jour: COMPANY_ADMIN → TENANT_ADMIN');
            }
            else {
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
    }
    catch (error) {
        console.error('❌ Erreur lors du seeding:', error);
        throw error;
    }
    finally {
        await app.close();
    }
}
seedDatabase()
    .then(() => {
    console.log('🎉 Script terminé');
    process.exit(0);
})
    .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
});
//# sourceMappingURL=seed-database.js.map