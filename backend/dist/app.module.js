"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const mongoose_1 = require("@nestjs/mongoose");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const tenants_module_1 = require("./tenants/tenants.module");
const projects_module_1 = require("./projects/projects.module");
const employees_module_1 = require("./employees/employees.module");
const attachments_module_1 = require("./attachments/attachments.module");
const intervenants_module_1 = require("./intervenants/intervenants.module");
const logs_module_1 = require("./logs/logs.module");
const envelopes_module_1 = require("./envelopes/envelopes.module");
const billing_module_1 = require("./billing/billing.module");
const ged_module_1 = require("./ged/ged.module");
const platform_module_1 = require("./platform/platform.module");
const payroll_settings_module_1 = require("./payroll-settings/payroll-settings.module");
const banking_settings_module_1 = require("./banking/banking-settings.module");
const document_parser_module_1 = require("./document-parser/document-parser.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const reconciliation_module_1 = require("./reconciliation/reconciliation.module");
const roles_module_1 = require("./roles/roles.module");
const ecritures_module_1 = require("./ecritures/ecritures.module");
const recrutement_module_1 = require("./recrutement/recrutement.module");
const evaluations_module_1 = require("./evaluations/evaluations.module");
const formations_module_1 = require("./formations/formations.module");
const payroll_module_1 = require("./payroll/payroll.module");
const absences_module_1 = require("./absences/absences.module");
const webhooks_module_1 = require("./webhooks/webhooks.module");
const facturation_module_1 = require("./facturation/facturation.module");
const pipeline_module_1 = require("./pipeline/pipeline.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            mongoose_1.MongooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => {
                    const uri = configService.get('DB_URI') || 'mongodb://localhost:27017/INVOCIA-TN';
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
                inject: [config_1.ConfigService],
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            tenants_module_1.TenantsModule,
            projects_module_1.ProjectsModule,
            employees_module_1.EmployeesModule,
            attachments_module_1.AttachmentsModule,
            intervenants_module_1.IntervenantsModule,
            logs_module_1.LogsModule,
            envelopes_module_1.EnvelopesModule,
            billing_module_1.BillingModule,
            ged_module_1.GEDModule,
            platform_module_1.PlatformModule,
            payroll_settings_module_1.PayrollSettingsModule,
            banking_settings_module_1.BankingSettingsModule,
            document_parser_module_1.DocumentParserModule,
            dashboard_module_1.DashboardModule,
            reconciliation_module_1.ReconciliationModule,
            roles_module_1.RolesModule,
            ecritures_module_1.EcrituresModule,
            recrutement_module_1.RecrutementModule,
            evaluations_module_1.EvaluationsModule,
            formations_module_1.FormationsModule,
            payroll_module_1.PayrollModule,
            absences_module_1.AbsencesModule,
            webhooks_module_1.WebhooksModule,
            facturation_module_1.FacturationModule,
            pipeline_module_1.PipelineModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map