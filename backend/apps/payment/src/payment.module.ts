import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createSqlJsConfig } from '@app/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentRecord } from './entities/payment.entity';

const paymentEntities = [PaymentRecord];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(
      createSqlJsConfig(
        process.env.PAYMENT_DB ?? 'data/payment.sqljs',
        paymentEntities,
      ),
    ),
    TypeOrmModule.forFeature([PaymentRecord]),
  ],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
