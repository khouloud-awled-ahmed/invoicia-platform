import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountingController } from './accounting.controller';
import { AccountingService } from './accounting.service';
import {
  AccountingEntry,
  AccountingEntrySchema,
} from '../../accounting/schemas/accounting-entry.schema';
import { Ecriture, EcritureSchema } from '../../ecritures/schemas/ecriture.schema';
import { Project, ProjectSchema } from '../../projects/schemas/project.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccountingEntry.name, schema: AccountingEntrySchema },
      { name: Ecriture.name, schema: EcritureSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
  ],
  controllers: [AccountingController],
  providers: [AccountingService],
  exports: [AccountingService],
})
export class AccountingModule {}
