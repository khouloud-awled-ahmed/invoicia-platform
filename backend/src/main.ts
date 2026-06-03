import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';
async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log'],
    });
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
      prefix: '/uploads',
    });
    const configService = app.get(ConfigService);
    const port = configService.get('PORT') || 3000;
    app.enableCors({
      origin: true,
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Accept, Authorization, x-tenant-id',
    });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        exceptionFactory: (errors) => {
          const messages = errors.map((error) => {
            const constraints = error.constraints || {};
            return Object.values(constraints).join(', ');
          });
          const errorMessage = messages.join('; ') || 'Erreur de validation';
          return new BadRequestException(errorMessage);
        },
      }),
    );
    app.setGlobalPrefix('api');
    // Swagger setup
    const config = new DocumentBuilder()
      .setTitle('Invoicia API')
      .setDescription('Invoicia SaaS Multi-Tenant Platform API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    await app.listen(port);
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🚀 Application is running on: http://localhost:' + port + '/api');
    console.log('📚 Swagger docs available at: http://localhost:' + port + '/api/docs');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
  } catch (error) {
    console.error('❌ ERREUR DE CONNEXION À LA BASE DE DONNÉES');
    console.error('Erreur détectée :', error.message);
    process.exit(1);
  }
}
bootstrap();
