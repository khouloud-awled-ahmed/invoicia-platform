import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BankingSettingsController } from './banking-settings.controller';
import { BankingAggregatorService } from './banking-aggregator.service';
import { EncryptionService } from './services/encryption.service';
import { DocumentParserModule } from '../document-parser/document-parser.module';
import { BankAccount, BankAccountSchema } from './schemas/bank-account.schema';
import { BankConnection, BankConnectionSchema } from './schemas/bank-connection.schema';
import { BankTransaction, BankTransactionSchema } from './schemas/bank-transaction.schema';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BankAccount.name, schema: BankAccountSchema },
      { name: BankConnection.name, schema: BankConnectionSchema },
      { name: BankTransaction.name, schema: BankTransactionSchema },
    ]),
    TenantsModule,
    DocumentParserModule,
  ],
  controllers: [BankingSettingsController],
  providers: [BankingAggregatorService, EncryptionService],
  exports: [
    BankingAggregatorService,
    EncryptionService,
    MongooseModule.forFeature([
      { name: BankAccount.name, schema: BankAccountSchema },
      { name: BankTransaction.name, schema: BankTransactionSchema },
    ]),
  ],
})
export class BankingSettingsModule {}
