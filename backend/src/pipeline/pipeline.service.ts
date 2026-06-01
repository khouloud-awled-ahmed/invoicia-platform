import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Opportunity, OpportunityDocument } from './opportunity.schema';

@Injectable()
export class PipelineService {
  constructor(
    @InjectModel(Opportunity.name)
    private opportunityModel: Model<OpportunityDocument>,
  ) {}

  async findAll(tenantId: string) {
    return this.opportunityModel.find({ tenantId }).sort({ createdAt: -1 });
  }

  async create(data: any, tenantId: string) {
    return this.opportunityModel.create({ ...data, tenantId });
  }

  async update(id: string, data: any) {
    return this.opportunityModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return this.opportunityModel.findByIdAndDelete(id);
  }
}
