import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDatabaseConfig } from '@app/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { BookingRecord } from './entities/booking.entity';

const bookingEntities = [BookingRecord];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(
      createDatabaseConfig(
        process.env.BOOKING_DB_URL ?? 'postgresql://yaring:yaring_secret@localhost:5432/booking_db',
        bookingEntities,
      ),
    ),
    TypeOrmModule.forFeature([BookingRecord]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
