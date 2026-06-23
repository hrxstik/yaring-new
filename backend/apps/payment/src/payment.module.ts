import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createDatabaseConfig } from '@app/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentRecord } from './entities/payment.entity';

const paymentEntities = [PaymentRecord];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(
      createDatabaseConfig(
        process.env.PAYMENT_DB_URL ?? process.env.PAYMENT_DB ?? 'data/payment.sqljs',
        paymentEntities,
      ),
    ),
    TypeOrmModule.forFeature([PaymentRecord]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
