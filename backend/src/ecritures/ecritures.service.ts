import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Ecriture, EcritureDocument } from './schemas/ecriture.schema';
@Injectable()
export class EcrituresService {
  constructor(@InjectModel(Ecriture.name) private ecritureModel: Model<EcritureDocument>) {}
  async create(dto: any, tenantId: string) {
    return new this.ecritureModel({ ...dto, tenantId }).save();
  }
  async findAll(tenantId: string) {
    return this.ecritureModel.find({ tenantId }).sort({ date: -1 }).exec();
  }
}
