import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Health check raíz para la plataforma
  app.getHttpAdapter().get('/', (req, res) => {
    res.json({ status: 'ok' });
  });

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  const logger = new Logger('Main');
  logger.log(`Application is running on port ${port}`);
}
bootstrap();
