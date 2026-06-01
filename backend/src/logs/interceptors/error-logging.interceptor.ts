import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LogsService } from '../logs.service';
import { LogLevel, LogCategory, LogSource } from '../schemas/log-entry.schema';

@Injectable()
export class ErrorLoggingInterceptor implements NestInterceptor {
  constructor(private readonly logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const request = context.switchToHttp().getRequest();
        const { method, url, ip, headers, user } = request;

        // Logger toutes les erreurs non gérées
        this.logsService.createLog({
          level: LogLevel.ERROR,
          category: LogCategory.TECHNICAL,
          source: LogSource.BACKEND,
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
          // Ignorer les erreurs de logging
        });

        throw error;
      }),
    );
  }
}
