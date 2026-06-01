import { ClientsService } from './clients.service';
export declare class ClientsController {
    private readonly clientsService;
    constructor(clientsService: ClientsService);
    create(createDto: any, user: any): Promise<import("../../../clients/schemas/client.schema").Client>;
    findAll(user: any): Promise<import("../../../clients/schemas/client.schema").Client[]>;
    findOne(id: string, user: any): Promise<import("../../../clients/schemas/client.schema").Client>;
    update(id: string, updateDto: any, user: any): Promise<import("../../../clients/schemas/client.schema").Client>;
    remove(id: string, user: any): Promise<void>;
}
