import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PipelineController } from './pipeline.controller';
import { PipelineService } from './pipeline.service';
import { Opportunity, OpportunitySchema } from './opportunity.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Opportunity.name, schema: OpportunitySchema }])],
  controllers: [PipelineController],
  providers: [PipelineService],
})
export class PipelineModule {}
