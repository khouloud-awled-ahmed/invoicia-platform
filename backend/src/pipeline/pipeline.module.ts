import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PipelineController } from './pipeline.controller';
import { PipelineService } from './pipeline.service';
import { Opportunity, OpportunitySchema } from './opportunity.schema';
import { DocumentParserModule } from '../document-parser/document-parser.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Opportunity.name, schema: OpportunitySchema }]),
    DocumentParserModule,
  ],
  controllers: [PipelineController],
  providers: [PipelineService],
})
export class PipelineModule {}
