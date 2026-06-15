import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { BookingModule } from './booking.module';

async function bootstrap() {
  const app = await NestFactory.create(BookingModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: true, credentials: true });
  await app.listen(process.env.BOOKING_PORT ?? 3003);
}
bootstrap();
