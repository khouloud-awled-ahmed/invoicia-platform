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
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const logs_service_1 = require("../logs.service");
const log_entry_schema_1 = require("../schemas/log-entry.schema");
let LoggingInterceptor = class LoggingInterceptor {
    constructor(logsService) {
        this.logsService = logsService;
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        const { method, url, ip, headers, body, user } = request;
        const startTime = Date.now();
        if (url.includes('/health') || url.includes('/logs') || url.includes('/api/health')) {
            return next.handle();
        }
        return next.handle().pipe((0, operators_1.tap)(() => {
            const duration = Date.now() - startTime;
            const statusCode = response.statusCode;
            if (statusCode >= 400 || duration > 1000) {
                this.logsService.createLog({
                    level: statusCode >= 500 ? log_entry_schema_1.LogLevel.ERROR : statusCode >= 400 ? log_entry_schema_1.LogLevel.WARN : log_entry_schema_1.LogLevel.INFO,
                    category: log_entry_schema_1.LogCategory.API,
                    source: log_entry_schema_1.LogSource.BACKEND,
                    message: `${method} ${url} - ${statusCode} (${duration}ms)`,
                    metadata: {
                        userId: user?.userId,
                        tenantId: user?.tenantId,
                        ipAddress: ip,
                        userAgent: headers['user-agent'],
                        endpoint: url,
                        method,
                        statusCode,
                        duration,
                    },
                }).catch(() => {
                });
            }
        }), (0, operators_1.catchError)((error) => {
            const duration = Date.now() - startTime;
            const statusCode = error instanceof common_1.HttpException ? error.getStatus() : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
            this.logsService.createLog({
                level: log_entry_schema_1.LogLevel.ERROR,
                category: statusCode >= 500 ? log_entry_schema_1.LogCategory.TECHNICAL : log_entry_schema_1.LogCategory.API,
                source: log_entry_schema_1.LogSource.BACKEND,
                message: `${method} ${url} - Error ${statusCode}: ${error.message}`,
                metadata: {
                    userId: user?.userId,
                    tenantId: user?.tenantId,
                    ipAddress: ip,
                    userAgent: headers['user-agent'],
                    endpoint: url,
                    method,
                    statusCode,
                    duration,
                },
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                    code: error.code,
                    details: error.response || error,
                },
            }).catch(() => {
            });
            return (0, rxjs_1.throwError)(() => error);
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [logs_service_1.LogsService])
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map