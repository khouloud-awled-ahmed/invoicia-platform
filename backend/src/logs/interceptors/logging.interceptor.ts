import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { LogsService } from '../logs.service';
import { LogLevel, LogCategory, LogSource } from '../schemas/log-entry.schema';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logsService: LogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url, ip, headers, body, user } = request;
    const startTime = Date.now();

    // Ignorer les endpoints de health check et de monitoring
    if (url.includes('/health') || url.includes('/logs') || url.includes('/api/health')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        // Logger les requêtes lentes ou les erreurs
        if (statusCode >= 400 || duration > 1000) {
          this.logsService.createLog({
            level: statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO,
            category: LogCategory.API,
            source: LogSource.BACKEND,
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
            // Ignorer les erreurs de logging pour éviter les boucles infinies
          });
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        const statusCode = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        // Logger toutes les erreurs
        this.logsService.createLog({
          level: LogLevel.ERROR,
          category: statusCode >= 500 ? LogCategory.TECHNICAL : LogCategory.API,
          source: LogSource.BACKEND,
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
          // Ignorer les erreurs de logging
        });

        return throwError(() => error);
      }),
    );
  }
}
