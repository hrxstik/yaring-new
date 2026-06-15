import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';

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
  get(@Param('id') id: string) {
    return this.payment.getPayment(id);
  }

  @Post('payments/:id/mock-complete')
  mockComplete(@Param('id') id: string) {
    return this.payment.mockComplete(id);
  }

  @Post('webhook/yookassa')
  webhook(@Body() payload: unknown) {
    return this.payment.handleWebhook(
      payload as {
        event: string;
        object: { id: string; status: string; metadata?: Record<string, string> };
      },
    );
  }
}
