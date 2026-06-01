"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankingSettingsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const banking_settings_controller_1 = require("./banking-settings.controller");
const banking_aggregator_service_1 = require("./banking-aggregator.service");
const encryption_service_1 = require("./services/encryption.service");
const document_parser_module_1 = require("../document-parser/document-parser.module");
const bank_account_schema_1 = require("./schemas/bank-account.schema");
const bank_connection_schema_1 = require("./schemas/bank-connection.schema");
const bank_transaction_schema_1 = require("./schemas/bank-transaction.schema");
const tenants_module_1 = require("../tenants/tenants.module");
let BankingSettingsModule = class BankingSettingsModule {
};
exports.BankingSettingsModule = BankingSettingsModule;
exports.BankingSettingsModule = BankingSettingsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: bank_account_schema_1.BankAccount.name, schema: bank_account_schema_1.BankAccountSchema },
                { name: bank_connection_schema_1.BankConnection.name, schema: bank_connection_schema_1.BankConnectionSchema },
                { name: bank_transaction_schema_1.BankTransaction.name, schema: bank_transaction_schema_1.BankTransactionSchema },
            ]),
            tenants_module_1.TenantsModule,
            document_parser_module_1.DocumentParserModule,
        ],
        controllers: [banking_settings_controller_1.BankingSettingsController],
        providers: [banking_aggregator_service_1.BankingAggregatorService, encryption_service_1.EncryptionService],
        exports: [
            banking_aggregator_service_1.BankingAggregatorService,
            encryption_service_1.EncryptionService,
            mongoose_1.MongooseModule.forFeature([
                { name: bank_account_schema_1.BankAccount.name, schema: bank_account_schema_1.BankAccountSchema },
                { name: bank_transaction_schema_1.BankTransaction.name, schema: bank_transaction_schema_1.BankTransactionSchema },
            ]),
        ],
    })
], BankingSettingsModule);
//# sourceMappingURL=banking-settings.module.js.map