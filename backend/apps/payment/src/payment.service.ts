import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
  BadGatewayException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios, { AxiosError } from 'axios';
import { BOOKING_RULES, parseIsoDate } from '@app/common';
import { PaymentRecord } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(PaymentRecord)
    private readonly payments: Repository<PaymentRecord>,
  ) {}

  async createPayment(
    userId: string,
    bookingId: string,
    amount: number,
    description: string,
  ) {
    const booking = await this.fetchBooking(bookingId);

    if (booking.userId !== userId) {
      throw new ForbiddenException('Нет доступа к бронированию');
    }
    if (booking.status !== 'pending_payment') {
      throw new BadRequestException('Бронь уже оплачена или отменена');
    }

    const expectedAmount = Number(booking.totalPrice);
    if (Math.abs(amount - expectedAmount) > 0.01) {
      this.logger.warn(
        `Клиент передал сумму ${amount}, ожидалось ${expectedAmount} для брони ${bookingId}`,
      );
    }

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;
    const returnUrl =
      process.env.YOOKASSA_RETURN_URL ?? 'http://localhost:3000/profile';

    const payment = this.payments.create({
      bookingId,
      userId,
      amount: expectedAmount,
      status: 'pending',
    });
    await this.payments.save(payment);

    if (!shopId || !secretKey) {
      this.logger.warn('YooKassa не настроена — mock-оплата');
      payment.yookassaPaymentId = `mock-${payment.id}`;
      payment.confirmationUrl = `${returnUrl}?payment=mock&paymentId=${payment.id}`;
      await this.payments.save(payment);
      return {
        paymentId: payment.id,
        confirmationUrl: payment.confirmationUrl,
        status: payment.status,
      };
    }

    const idempotenceKey = payment.id;
    const auth = Buffer.from(`${shopId}:${secretKey}`).toString('base64');

    const { data } = await axios.post(
      'https://api.yookassa.ru/v3/payments',
      {
        amount: { value: expectedAmount.toFixed(2), currency: 'RUB' },
        capture: true,
        confirmation: { type: 'redirect', return_url: returnUrl },
        description,
        metadata: { bookingId, paymentId: payment.id },
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Idempotence-Key': idempotenceKey,
          'Content-Type': 'application/json',
        },
      },
    );

    payment.yookassaPaymentId = data.id;
    payment.confirmationUrl = data.confirmation?.confirmation_url;
    await this.payments.save(payment);

    return {
      paymentId: payment.id,
      confirmationUrl: payment.confirmationUrl,
      status: payment.status,
    };
  }

  async handleWebhook(payload: {
    event: string;
    object: { id: string; status: string; metadata?: Record<string, string> };
  }) {
    if (payload.event !== 'payment.succeeded') return { ok: true };

    const yookassaId = payload.object.id;
    const payment = await this.payments.findOne({
      where: { yookassaPaymentId: yookassaId },
    });
    if (!payment) throw new NotFoundException('Платёж не найден');

    payment.status = 'succeeded';
    await this.payments.save(payment);
    await this.confirmBooking(payment.bookingId, payment.id);
    return { ok: true };
  }

  async getPayment(id: string, userId?: string) {
    const payment = await this.payments.findOne({ where: { id } });
    if (!payment) throw new NotFoundException('Платёж не найден');
    if (userId && payment.userId !== userId) {
      throw new ForbiddenException('Нет доступа к платежу');
    }
    return {
      id: payment.id,
      bookingId: payment.bookingId,
      amount: Number(payment.amount),
      status: payment.status,
      confirmationUrl: payment.confirmationUrl,
      createdAt: payment.createdAt.toISOString(),
    };
  }

  async mockComplete(paymentId: string, userId?: string) {
    const payment = await this.payments.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Платёж не найден');
    if (userId && payment.userId !== userId) {
      throw new ForbiddenException('Нет доступа к платежу');
    }
    if (payment.status === 'succeeded') {
      throw new BadRequestException('Платёж уже выполнен');
    }
    payment.status = 'succeeded';
    await this.payments.save(payment);
    await this.confirmBooking(payment.bookingId, payment.id);
    return this.getPayment(payment.id, userId);
  }

  async cancelWithRefund(bookingId: string, userId: string, isAdmin: boolean) {
    const booking = await this.fetchBooking(bookingId);

    if (!isAdmin && booking.userId !== userId) {
      throw new ForbiddenException('Нет доступа к бронированию');
    }
    if (booking.status !== 'confirmed') {
      throw new BadRequestException('Бронь не в статусе confirmed');
    }

    const payment = await this.payments.findOne({
      where: { bookingId, status: 'succeeded' },
      order: { createdAt: 'DESC' },
    });

    const refundAmount = this.calcRefundAmount(
      Number(booking.totalPrice),
      booking.startDate,
    );

    await this.cancelBooking(bookingId, userId, isAdmin);

    if (!payment || refundAmount <= 0) {
      return { refundAmount: 0, message: 'Возврат не предусмотрен по условиям отмены' };
    }

    if (payment.yookassaPaymentId?.startsWith('mock-')) {
      return { refundAmount, message: `Mock-возврат: ${refundAmount} ₽` };
    }

    const shopId = process.env.YOOKASSA_SHOP_ID;
    const secretKey = process.env.YOOKASSA_SECRET_KEY;
    if (!shopId || !secretKey) {
      return { refundAmount, message: `Возврат ${refundAmount} ₽ (YooKassa не настроена)` };
    }

    const auth = Buffer.from(`${shopId}:${secretKey}`).toString('base64');
    const { data } = await axios.post(
      'https://api.yookassa.ru/v3/refunds',
      {
        payment_id: payment.yookassaPaymentId,
        amount: { value: refundAmount.toFixed(2), currency: 'RUB' },
        description: `Возврат по отмене брони ${bookingId}`,
      },
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Idempotence-Key': `refund-${payment.id}`,
          'Content-Type': 'application/json',
        },
      },
    );

    this.logger.log(`YooKassa refund created: ${data.id} for ${refundAmount} RUB`);
    return { refundAmount, yookassaRefundId: data.id, message: `Возврат ${refundAmount} ₽ инициирован` };
  }

  private calcRefundAmount(totalPrice: number, startDate: string): number {
    const start = parseIsoDate(startDate);
    if (!start) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysUntilCheckIn = Math.ceil((start.getTime() - today.getTime()) / 86400000);

    if (daysUntilCheckIn >= BOOKING_RULES.cancellationFreeDays) return totalPrice;
    if (daysUntilCheckIn >= BOOKING_RULES.cancellationPartialDays) return Math.round(totalPrice * 0.5);
    return 0;
  }

  private async fetchBooking(bookingId: string) {
    const bookingUrl = process.env.BOOKING_SERVICE_URL ?? 'http://localhost:3003';
    try {
      const { data } = await axios.get(`${bookingUrl}/bookings/${bookingId}`);
      return data as { userId: string; status: string; totalPrice: number; startDate: string };
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        throw new NotFoundException('Бронь не найдена');
      }
      throw new BadGatewayException('Сервис бронирования недоступен');
    }
  }

  private async cancelBooking(bookingId: string, userId: string, isAdmin: boolean) {
    const bookingUrl = process.env.BOOKING_SERVICE_URL ?? 'http://localhost:3003';
    const secret = process.env.INTERNAL_SERVICE_SECRET;
    await axios.post(
      `${bookingUrl}/bookings/${bookingId}/cancel`,
      {},
      {
        headers: {
          'x-user-id': userId,
          'x-user-role': isAdmin ? 'admin' : 'user',
          ...(secret ? { 'x-internal-secret': secret } : {}),
        },
      },
    );
  }

  private async confirmBooking(bookingId: string, paymentId: string) {
    const bookingUrl = process.env.BOOKING_SERVICE_URL ?? 'http://localhost:3003';
    await axios.post(`${bookingUrl}/bookings/${bookingId}/confirm`, { paymentId });
  }
}
