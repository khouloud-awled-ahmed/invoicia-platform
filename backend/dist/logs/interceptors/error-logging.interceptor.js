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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorLoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const logs_service_1 = require("../logs.service");
const log_entry_schema_1 = require("../schemas/log-entry.schema");
let ErrorLoggingInterceptor = class ErrorLoggingInterceptor {
    constructor(logsService) {
        this.logsService = logsService;
    }
    intercept(context, next) {
        return next.handle().pipe((0, operators_1.catchError)((error) => {
            const request = context.switchToHttp().getRequest();
            const { method, url, ip, headers, user } = request;
            this.logsService.createLog({
                level: log_entry_schema_1.LogLevel.ERROR,
                category: log_entry_schema_1.LogCategory.TECHNICAL,
                source: log_entry_schema_1.LogSource.BACKEND,
                message: `Unhandled error: ${error.message || 'Unknown error'}`,
                metadata: {
                    userId: user?.userId,
                    tenantId: user?.tenantId,
                    ipAddress: ip,
                    userAgent: headers['user-agent'],
                    endpoint: url,
                    method,
                },
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                    code: error.code,
                    details: error,
                },
            }).catch(() => {
            });
            throw error;
        }));
    }
};
exports.ErrorLoggingInterceptor = ErrorLoggingInterceptor;
exports.ErrorLoggingInterceptor = ErrorLoggingInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logs_service_1.LogsService])
], ErrorLoggingInterceptor);
//# sourceMappingURL=error-logging.interceptor.js.map