"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const path_1 = require("path");
const app_module_1 = require("./app.module");
async function bootstrap() {
    try {
        const app = await core_1.NestFactory.create(app_module_1.AppModule, {
            logger: ['error', 'warn', 'log'],
        });
        app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
            prefix: '/uploads',
        });
        const configService = app.get(config_1.ConfigService);
        const port = configService.get('PORT') || 3000;
        app.enableCors({
            origin: true,
            credentials: true,
            methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
            allowedHeaders: 'Content-Type, Accept, Authorization, x-tenant-id',
        });
        app.useGlobalPipes(new common_1.ValidationPipe({
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
                return new common_1.BadRequestException(errorMessage);
            },
        }));
        app.setGlobalPrefix('api');
        const config = new swagger_1.DocumentBuilder()
            .setTitle('Invoicia API')
            .setDescription('Invoicia SaaS Multi-Tenant Platform API Documentation')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('api/docs', app, document);
        await app.listen(port);
        console.log('');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🚀 Application is running on: http://localhost:' + port + '/api');
        console.log('📚 Swagger docs available at: http://localhost:' + port + '/api/docs');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');
    }
    catch (error) {
        console.error('❌ ERREUR DE CONNEXION À LA BASE DE DONNÉES');
        console.error('Erreur détectée :', error.message);
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map