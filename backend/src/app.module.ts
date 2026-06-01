import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { ProjectsModule } from './projects/projects.module';
import { EmployeesModule } from './employees/employees.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { IntervenantsModule } from './intervenants/intervenants.module';
import { LogsModule } from './logs/logs.module';
import { EnvelopesModule } from './envelopes/envelopes.module';
import { BillingModule } from './billing/billing.module';
import { GEDModule } from './ged/ged.module';
import { PlatformModule } from './platform/platform.module';
import { PayrollSettingsModule } from './payroll-settings/payroll-settings.module';
import { BankingSettingsModule } from './banking/banking-settings.module';
import { DocumentParserModule } from './document-parser/document-parser.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReconciliationModule } from './reconciliation/reconciliation.module';
import { RolesModule } from './roles/roles.module';
import { EcrituresModule } from './ecritures/ecritures.module';
import { RecrutementModule } from './recrutement/recrutement.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { FormationsModule } from './formations/formations.module';
import { PayrollModule } from './payroll/payroll.module';
import { AbsencesModule } from './absences/absences.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { FacturationModule } from './facturation/facturation.module';
import { PipelineModule } from './pipeline/pipeline.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('DB_URI') || 'mongodb://localhost:27017/INVOCIA-TN';
        return {
          uri,
          retryAttempts: 5,
          retryDelay: 3000,
          connectionFactory: (connection) => {
            connection.on('connected', () => {
              console.log('✅ MongoDB connected successfully');
            });
            connection.on('error', (err) => {
              console.error('❌ MongoDB connection error:', err.message);
            });
            connection.on('disconnected', () => {
              console.warn('⚠️ MongoDB disconnected');
            });
            return connection;
          },
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    TenantsModule,
    ProjectsModule,
    EmployeesModule,
    AttachmentsModule,
    IntervenantsModule,
    LogsModule,
    EnvelopesModule,
    BillingModule,
    GEDModule,
    PlatformModule,
    PayrollSettingsModule,
    BankingSettingsModule,
    DocumentParserModule,
    DashboardModule,
    ReconciliationModule,
    RolesModule,
    EcrituresModule,
    RecrutementModule,
    EvaluationsModule,
    FormationsModule,
    PayrollModule,
    AbsencesModule,
    WebhooksModule,
    FacturationModule,
    PipelineModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
