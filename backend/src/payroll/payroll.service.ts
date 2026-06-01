import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bulletin, BulletinDocument } from './schemas/bulletin.schema';
@Injectable()
export class PayrollService {
  constructor(@InjectModel(Bulletin.name) private bulletinModel: Model<BulletinDocument>) {}
  async create(dto: any, tenantId: string) {
    return new this.bulletinModel({ ...dto, tenantId }).save();
  }
  async findAll(tenantId: string) {
    return this.bulletinModel.find({ tenantId }).sort({ year: -1, month: -1 }).exec();
  }
  async validate(id: string, tenantId: string) {
    const b = await this.bulletinModel.findOneAndUpdate({ _id: id, tenantId }, { status: 'validated' }, { new: true });
    if (!b) throw new NotFoundException();
    return b;
  }
  async pay(id: string, tenantId: string) {
    const b = await this.bulletinModel.findOneAndUpdate({ _id: id, tenantId }, { status: 'paid' }, { new: true });
    if (!b) throw new NotFoundException();
    return b;
  }
}
