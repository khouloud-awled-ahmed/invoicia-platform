import { NestFactory } from '@nestjs/core';
import { ValidationPipe, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log'],
    });
    
    // Servir les fichiers statiques pour les certificats et uploads
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
      prefix: '/uploads',
    });
    
    const configService = app.get(ConfigService);
    const port = configService.get('PORT') || 3000;

    // 👇 C'EST ICI QUE J'AI CORRIGÉ LE PROBLÈME 👇
    // On permet tout (origin: true) et on ajoute 'x-tenant-id' dans les headers autorisés
    app.enableCors({
      origin: true, // Accepte toutes les origines (localhost:5173, localhost:3002, etc.)
      credentials: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: 'Content-Type, Accept, Authorization, x-tenant-id', // J'ai ajouté x-tenant-id ici
    });
    // 👆 FIN DE LA CORRECTION 👆

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        exceptionFactory: (errors) => {
          const messages = errors.map(error => {
            const constraints = error.constraints || {};
            return Object.values(constraints).join(', ');
          });
          const errorMessage = messages.join('; ') || 'Erreur de validation';
          console.error('[VALIDATION ERROR]', JSON.stringify(errors, null, 2));
          console.error('[VALIDATION ERROR MESSAGE]', errorMessage);
          return new BadRequestException(errorMessage);
        },
      }),
    );

    // Global prefix
    app.setGlobalPrefix('api');

    await app.listen(port);
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🚀 Application is running on: http://localhost:' + port + '/api');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('❌ ERREUR DE CONNEXION À LA BASE DE DONNÉES');
    console.error('═══════════════════════════════════════════════════════════');
    console.error('');
    
    if (error.message && error.message.includes('ECONNREFUSED')) {
      console.error('🔍 Problème détecté : MongoDB n\'est pas accessible');
      const dbUri = process.env.DB_URI || 'mongodb://localhost:27017/invoicia';
      console.error('      DB_URI actuel : ' + dbUri);
    } else {
      console.error('Erreur détectée :', error.message);
    }
    
    console.error('═══════════════════════════════════════════════════════════');
    process.exit(1);
  }
}

bootstrap();

