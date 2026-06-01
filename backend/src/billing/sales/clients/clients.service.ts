import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Client, ClientDocument } from '../../../clients/schemas/client.schema';

@Injectable()
export class ClientsService {
  constructor(@InjectModel(Client.name) private clientModel: Model<ClientDocument>) {}

  async create(createDto: any, tenantId: string): Promise<Client> {
    const client = new this.clientModel({ ...createDto, tenantId });
    return client.save();
  }

  async findAll(tenantId: string): Promise<Client[]> {
    return this.clientModel.find({ tenantId }).exec();
  }

  async findOne(id: string, tenantId: string): Promise<Client> {
    const client = await this.clientModel.findOne({ _id: id, tenantId }).exec();
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  async update(id: string, updateDto: any, tenantId: string): Promise<Client> {
    const updated = await this.clientModel
      .findOneAndUpdate({ _id: id, tenantId }, updateDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string, tenantId: string): Promise<void> {
    const result = await this.clientModel.findOneAndDelete({ _id: id, tenantId }).exec();
    if (!result) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
  }
}
