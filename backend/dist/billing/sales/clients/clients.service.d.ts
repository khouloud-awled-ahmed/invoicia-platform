import { Model } from 'mongoose';
import { Client, ClientDocument } from '../../../clients/schemas/client.schema';
export declare class ClientsService {
    private clientModel;
    constructor(clientModel: Model<ClientDocument>);
    create(createDto: any, tenantId: string): Promise<Client>;
    findAll(tenantId: string): Promise<Client[]>;
    findOne(id: string, tenantId: string): Promise<Client>;
    update(id: string, updateDto: any, tenantId: string): Promise<Client>;
    remove(id: string, tenantId: string): Promise<void>;
}
