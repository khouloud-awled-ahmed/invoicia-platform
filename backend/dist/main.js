"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
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
                const messages = errors.map(error => {
                    const constraints = error.constraints || {};
                    return Object.values(constraints).join(', ');
                });
                const errorMessage = messages.join('; ') || 'Erreur de validation';
                console.error('[VALIDATION ERROR]', JSON.stringify(errors, null, 2));
                console.error('[VALIDATION ERROR MESSAGE]', errorMessage);
                return new common_1.BadRequestException(errorMessage);
            },
        }));
        app.setGlobalPrefix('api');
        await app.listen(port);
        console.log('');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🚀 Application is running on: http://localhost:' + port + '/api');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('');
    }
    catch (error) {
        console.error('');
        console.error('═══════════════════════════════════════════════════════════');
        console.error('❌ ERREUR DE CONNEXION À LA BASE DE DONNÉES');
        console.error('═══════════════════════════════════════════════════════════');
        console.error('');
        if (error.message && error.message.includes('ECONNREFUSED')) {
            console.error('🔍 Problème détecté : MongoDB n\'est pas accessible');
            const dbUri = process.env.DB_URI || 'mongodb://localhost:27017/invoicia';
            console.error('      DB_URI actuel : ' + dbUri);
        }
        else {
            console.error('Erreur détectée :', error.message);
        }
        console.error('═══════════════════════════════════════════════════════════');
        process.exit(1);
    }
}
bootstrap();
//# sourceMappingURL=main.js.map