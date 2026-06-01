import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Evaluation, EvaluationDocument } from './schemas/evaluation.schema';
@Injectable()
export class EvaluationsService {
  constructor(@InjectModel(Evaluation.name) private evalModel: Model<EvaluationDocument>) {}
  async create(dto: any, tenantId: string) {
    return new this.evalModel({ ...dto, tenantId }).save();
  }
  async findAll(tenantId: string) {
    return this.evalModel.find({ tenantId }).sort({ date: -1 }).exec();
  }
  async remove(id: string, tenantId: string) {
    const e = await this.evalModel.findOneAndDelete({ _id: id, tenantId });
    if (!e) throw new NotFoundException();
  }
}
