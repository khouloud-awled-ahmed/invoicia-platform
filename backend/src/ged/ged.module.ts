import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GEDController } from './ged.controller';
import { GEDService } from './ged.service';
import { GEDFolder, GEDFolderSchema } from './schemas/ged-folder.schema';
import { GEDDocument, GEDDocumentSchema } from './schemas/ged-document.schema';
import {
  GEDClassificationRule,
  GEDClassificationRuleSchema,
} from './schemas/ged-classification-rule.schema';
import { AttachmentsModule } from '../attachments/attachments.module';
import { GEDInitializationService } from './ged-initialization.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GEDFolder.name, schema: GEDFolderSchema },
      { name: GEDDocument.name, schema: GEDDocumentSchema },
      { name: GEDClassificationRule.name, schema: GEDClassificationRuleSchema },
    ]),
    AttachmentsModule,
  ],
  controllers: [GEDController],
  providers: [GEDService, GEDInitializationService],
  exports: [GEDService, GEDInitializationService],
})
export class GEDModule {}
