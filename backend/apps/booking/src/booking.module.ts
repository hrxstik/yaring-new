import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createSqlJsConfig } from '@app/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingRecord } from './entities/booking.entity';

const bookingEntities = [BookingRecord];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(
      createSqlJsConfig(
        process.env.BOOKING_DB ?? 'data/booking.sqljs',
        bookingEntities,
      ),
    ),
    TypeOrmModule.forFeature([BookingRecord]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
