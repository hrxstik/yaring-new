import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { CatalogModule } from './catalog.module';

async function bootstrap() {
  const app = await NestFactory.create(CatalogModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: true, credentials: true });
  await app.listen(process.env.CATALOG_PORT ?? 3002);
}
bootstrap();
