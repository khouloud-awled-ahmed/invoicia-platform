import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogsService } from './logs.service';
import { LogsController } from './logs.controller';
import { LogEntry, LogEntrySchema } from './schemas/log-entry.schema';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: LogEntry.name, schema: LogEntrySchema }])],
  controllers: [LogsController],
  providers: [
    LogsService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
  exports: [LogsService],
})
export class LogsModule {}
