import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  const PORT = process.env.PORT || 3000;

  const config = new DocumentBuilder()
    .setTitle('nadin-soft')
    .setDescription('nadin app api')
    .setVersion('1.0')
    .addTag('nadin')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter',
        in: 'header',
      },
      'JWT_auth',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(PORT, () => {
    console.log(
      `app is running on ${process.env.NODE_ENV} mode and port ${PORT}`,
    );
  });
}
bootstrap();
