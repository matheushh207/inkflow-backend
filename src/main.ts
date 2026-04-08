import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    
    // Configuração do Swagger
    const config = new DocumentBuilder()
        .setTitle('InkFlow CRM API')
        .setDescription('API de Gestão de Estúdios com Isolamento de Dados e Cobrança')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // Validação Global
    app.useGlobalPipes(new ValidationPipe());
    
    app.enableCors();
    const port = process.env.PORT || 3001; // Ajustado para 3001 conforme frontend .env
    
    await app.listen(port, '0.0.0.0');
    console.log(`\n🚀 InkFlow 150% Pronto!`);
    console.log(`📡 Backend: http://localhost:${port}`);
    console.log(`📚 Documentação API: http://localhost:${port}/api\n`);
}
bootstrap();
