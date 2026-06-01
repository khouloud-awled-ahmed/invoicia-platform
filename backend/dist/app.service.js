"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let AppService = class AppService {
    constructor(connection) {
        this.connection = connection;
    }
    async onModuleInit() {
        try {
            if (this.connection.readyState === 1) {
                console.log('✅ MongoDB connection verified');
            }
            else {
                console.warn('⚠️ MongoDB connection state: ' + this.getConnectionState(this.connection.readyState));
            }
        }
        catch (error) {
            console.error('❌ Error verifying MongoDB connection:', error.message);
        }
    }
    getConnectionState(state) {
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting',
            99: 'uninitialized',
        };
        return states[state] || 'unknown';
    }
    getHello() {
        return 'Invoicia API - Backend Service';
    }
    getHealth() {
        const dbStatus = this.connection.readyState === 1 ? 'connected' : 'disconnected';
        return {
            status: dbStatus === 'connected' ? 'ok' : 'degraded',
            timestamp: new Date().toISOString(),
            service: 'Invoicia API',
            database: {
                status: dbStatus,
                type: 'MongoDB',
            },
        };
    }
};
exports.AppService = AppService;
exports.AppService = AppService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectConnection)()),
    __metadata("design:paramtypes", [mongoose_2.Connection])
], AppService);
//# sourceMappingURL=app.service.js.map