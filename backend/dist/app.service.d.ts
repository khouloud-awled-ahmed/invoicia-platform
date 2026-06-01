import { OnModuleInit } from '@nestjs/common';
import { Connection } from 'mongoose';
export declare class AppService implements OnModuleInit {
    private connection;
    constructor(connection: Connection);
    onModuleInit(): Promise<void>;
    private getConnectionState;
    getHello(): string;
    getHealth(): {
        status: string;
        timestamp: string;
        service: string;
        database: {
            status: string;
            type: string;
        };
    };
}
