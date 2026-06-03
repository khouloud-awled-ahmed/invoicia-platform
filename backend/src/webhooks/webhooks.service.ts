import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Webhook } from './webhook.schema';

@Injectable()
export class WebhooksService {
  constructor(@InjectModel(Webhook.name) private webhookModel: Model<Webhook>) {}

  async findAll(tenantId: string) {
    const docs = await this.webhookModel.find({ tenantId }).lean();
    return docs.map((d) => ({ ...d, id: d._id?.toString() }));
  }

  async create(tenantId: string, dto: any) {
    const secret = Math.random().toString(36).substring(2, 15);
    const webhook = new this.webhookModel({ ...dto, tenantId, secret });
    return webhook.save();
  }

  async update(id: string, tenantId: string, dto: any) {
    return this.webhookModel.findOneAndUpdate({ _id: id, tenantId }, dto, { new: true });
  }

  async remove(id: string, tenantId: string) {
    return this.webhookModel.findOneAndDelete({ _id: id, tenantId });
  }
}
