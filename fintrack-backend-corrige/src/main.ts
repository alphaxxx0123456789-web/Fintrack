import 'reflect-metadata';
import { json } from 'express';
import { NestFactory, Reflector } from '@nestjs/core';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Limite par défaut d'Express (~100kb) trop petite pour un avatar encodé
  // en base64 ; on l'augmente pour ce cas d'usage précis.
  app.use(json({ limit: '5mb' }));

  // Validation globale des DTO (class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // supprime les champs non déclarés dans les DTO
      forbidNonWhitelisted: true, // rejette la requête si des champs inconnus sont envoyés
      transform: true, // transforme automatiquement les payloads en instances de classe
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // IMPORTANT : sans cet interceptor, les décorateurs @Exclude() des entités
  // (ex: User.password) n'ont AUCUN effet et le hash du mot de passe fuit
  // dans toutes les réponses JSON (GET /users, GET /users/:id, etc.).
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  // Filtre global pour uniformiser les réponses d'erreur / codes HTTP
  app.useGlobalFilters(new HttpExceptionFilter());

  // CORS pour consommation depuis le frontend FinTrack
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  // Documentation Swagger des endpoints principaux
  const config = new DocumentBuilder()
    .setTitle('FinTrack API')
    .setDescription(
      "API REST du backend FinTrack — gestion des finances personnelles (auth JWT, RBAC, transactions, catégories, taux de change).",
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`FinTrack API démarrée sur http://localhost:${port}/api`);
  // eslint-disable-next-line no-console
  console.log(`Documentation Swagger : http://localhost:${port}/api/docs`);
}
bootstrap();
