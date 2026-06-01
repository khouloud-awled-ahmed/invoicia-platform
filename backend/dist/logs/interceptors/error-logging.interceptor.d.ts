import { NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { LogsService } from '../logs.service';
export declare class ErrorLoggingInterceptor implements NestInterceptor {
    private readonly logsService;
    constructor(logsService: LogsService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
}
