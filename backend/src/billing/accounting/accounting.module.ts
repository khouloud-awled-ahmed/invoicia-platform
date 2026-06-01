import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountingController } from './accounting.controller';
import { AccountingService } from './accounting.service';
import { AccountingEntry, AccountingEntrySchema } from '../../accounting/schemas/accounting-entry.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: AccountingEntry.name, schema: AccountingEntrySchema }])],
  controllers: [AccountingController],
  providers: [AccountingService],
  exports: [AccountingService],
})
export class AccountingModule {}
