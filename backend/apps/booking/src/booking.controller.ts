import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './booking.dto';

@Controller()
export class BookingController {
  constructor(private readonly booking: BookingService) {}

  @Post('bookings')
  create(
    @Headers('x-user-id') userId: string,
    @Body() dto: CreateBookingDto,
  ) {
    return this.booking.create(userId, dto);
  }

  @Get('bookings/my')
  myBookings(@Headers('x-user-id') userId: string) {
    return this.booking.listByUser(userId);
  }

  @Get('bookings/:id')
  getById(@Param('id') id: string) {
    return this.booking.getById(id);
  }

  @Get('bookings')
  allBookings(@Headers('x-user-role') role?: string) {
    if (role !== 'admin') {
      throw new ForbiddenException('Доступ запрещён');
    }
    return this.booking.listAll();
  }

  @Get('availability/:entityId')
  availability(
    @Param('entityId') entityId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.booking.getAvailability(entityId, from, to);
  }

  @Post('bookings/:id/confirm')
  confirm(
    @Param('id') id: string,
    @Body('paymentId') paymentId: string,
  ) {
    return this.booking.confirmPayment(id, paymentId);
  }

  @Post('bookings/:id/cancel')
  cancel(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') role?: string,
  ) {
    return this.booking.cancel(id, userId, role === 'admin');
  }
}
