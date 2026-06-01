import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Offre, OffreDocument } from './schemas/offre.schema';
@Injectable()
export class RecrutementService {
  constructor(@InjectModel(Offre.name) private offreModel: Model<OffreDocument>) {}
  async create(dto: any, tenantId: string) {
    return new this.offreModel({ ...dto, tenantId }).save();
  }
  async findAll(tenantId: string) {
    return this.offreModel.find({ tenantId }).sort({ createdAt: -1 }).exec();
  }
  async updateStatus(id: string, statut: string, tenantId: string) {
    const o = await this.offreModel.findOneAndUpdate({ _id: id, tenantId }, { statut }, { new: true });
    if (!o) throw new NotFoundException();
    return o;
  }
}
