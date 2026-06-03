import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Formation, FormationDocument } from './schemas/formation.schema';
@Injectable()
export class FormationsService {
  constructor(@InjectModel(Formation.name) private formationModel: Model<FormationDocument>) {}
  async create(dto: any, tenantId: string) {
    return new this.formationModel({ ...dto, tenantId }).save();
  }
  async findAll(tenantId: string) {
    return this.formationModel.find({ tenantId }).sort({ createdAt: -1 }).exec();
  }
  async updateStatus(id: string, statut: string, tenantId: string) {
    const f = await this.formationModel.findOneAndUpdate(
      { _id: id, tenantId },
      { statut },
      { new: true },
    );
    if (!f) throw new NotFoundException();
    return f;
  }
  async remove(id: string, tenantId: string) {
    const f = await this.formationModel.findOneAndDelete({ _id: id, tenantId });
    if (!f) throw new NotFoundException();
  }
}
