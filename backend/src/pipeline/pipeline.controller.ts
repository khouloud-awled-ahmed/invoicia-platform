import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PipelineService } from './pipeline.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UniversalDocumentParserService } from '../document-parser/services/universal-document-parser.service';

@UseGuards(JwtAuthGuard)
@Controller('pipeline')
export class PipelineController {
  constructor(
    private readonly pipelineService: PipelineService,
    private readonly parserService: UniversalDocumentParserService,
  ) {}

  @Get('ai-priority-summary')
  async getAIPrioritySummary(@Request() req) {
    const opportunities = await this.pipelineService.findAll(req.user.tenantId);
    const active = opportunities.filter((o: any) => o.stage !== 'won' && o.stage !== 'lost');
    if (active.length === 0) return { summary: '' };

    const now = Date.now();
    const payload = active.map((o: any) => ({
      id: o._id.toString(),
      name: o.name,
      client: o.client,
      amount: o.amount,
      probability: o.probability,
      stage: o.stage,
      daysSinceCreated: Math.floor((now - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    }));

    const summary = await this.parserService.generatePipelinePrioritySummary(payload);
    return { summary };
  }

  @Get('ai-actions')
  async getAIActions(@Request() req) {
    const opportunities = await this.pipelineService.findAll(req.user.tenantId);
    const active = opportunities.filter((o: any) => o.stage !== 'won' && o.stage !== 'lost');
    if (active.length === 0) return [];

    const now = Date.now();
    const payload = active.map((o: any) => ({
      id: o._id.toString(),
      name: o.name,
      client: o.client,
      amount: o.amount,
      probability: o.probability,
      stage: o.stage,
      daysSinceCreated: Math.floor((now - new Date(o.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
    }));

    return this.parserService.generatePipelineActions(payload);
  }

  @Get()
  findAll(@Request() req) {
    return this.pipelineService.findAll(req.user.tenantId);
  }

  @Post()
  create(@Body() body: any, @Request() req) {
    return this.pipelineService.create(body, req.user.tenantId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.pipelineService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.pipelineService.delete(id);
  }
}
