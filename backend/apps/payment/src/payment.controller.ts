import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  RawBodyRequest,
  Req,
  UseGuards,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import type { Request } from 'express';
import { InternalGuard } from '@app/common';
import { PaymentService } from './payment.service';

@UseGuards(InternalGuard)
@Controller()
export class PaymentController {
  constructor(private readonly payment: PaymentService) {}

  @Post('payments')
  create(
    @Body()
    body: {
      userId: string;
      bookingId: string;
      amount: number;
      description: string;
    },
  ) {
    return this.payment.createPayment(
      body.userId,
      body.bookingId,
      body.amount,
      body.description,
    );
  }

  @Get('payments/:id')
  get(@Param('id') id: string, @Headers('x-user-id') userId?: string) {
    return this.payment.getPayment(id, userId);
  }

  @Post('payments/:id/mock-complete')
  mockComplete(@Param('id') id: string, @Headers('x-user-id') userId?: string) {
    return this.payment.mockComplete(id, userId);
  }

  @Post('webhook/yookassa')
  webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-yookassa-signature') signature?: string,
    @Body()
    payload?: {
      event: string;
      object: { id: string; status: string; metadata?: Record<string, string> };
    },
  ) {
    const secret = process.env.YOOKASSA_WEBHOOK_SECRET;
    if (secret && req.rawBody) {
      const expected = createHmac('sha256', secret)
        .update(req.rawBody)
        .digest('hex');
      if (signature !== expected) {
        throw new BadRequestException('Invalid webhook signature');
      }
    }
    return this.payment.handleWebhook(payload!);
  }
}
