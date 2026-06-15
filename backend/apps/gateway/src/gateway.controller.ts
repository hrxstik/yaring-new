import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { AuthGuardService } from './auth-guard.service';

@Controller('api')
export class GatewayController {
  constructor(
    private readonly proxy: ProxyService,
    private readonly auth: AuthGuardService,
  ) {}

  @Post('auth/register')
  register(@Body() body: unknown) {
    return this.proxy.forward('auth', '/register', {
      method: 'POST',
      data: body,
    });
  }

  @Post('auth/verify-email')
  verifyEmail(@Body() body: unknown) {
    return this.proxy.forward('auth', '/verify-email', {
      method: 'POST',
      data: body,
    });
  }

  @Post('auth/resend-code')
  resendCode(@Body() body: unknown) {
    return this.proxy.forward('auth', '/resend-code', {
      method: 'POST',
      data: body,
    });
  }

  @Post('auth/login')
  login(@Body() body: unknown) {
    return this.proxy.forward('auth', '/login', {
      method: 'POST',
      data: body,
    });
  }

  @Get('auth/me')
  async me(@Headers('authorization') authHeader?: string) {
    await this.auth.requireAuth(authHeader);
    return this.proxy.forward('auth', '/me', {
      headers: { Authorization: authHeader! },
    });
  }

  @Get('entities')
  listEntities(@Query('all') all?: string) {
    return this.proxy.forward('catalog', `/entities?all=${all ?? 'false'}`);
  }

  @Get('entities/:id')
  getEntity(@Param('id') id: string) {
    return this.proxy.forward('catalog', `/entities/${id}`);
  }

  @Post('entities')
  async createEntity(
    @Headers('authorization') authHeader: string,
    @Body() body: unknown,
  ) {
    await this.auth.requireAdmin(authHeader);
    return this.proxy.forward('catalog', '/entities', {
      method: 'POST',
      data: body,
    });
  }

  @Put('entities/:id')
  async updateEntity(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    await this.auth.requireAdmin(authHeader);
    return this.proxy.forward('catalog', `/entities/${id}`, {
      method: 'PUT',
      data: body,
    });
  }

  @Delete('entities/:id')
  async deleteEntity(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    await this.auth.requireAdmin(authHeader);
    return this.proxy.forward('catalog', `/entities/${id}`, {
      method: 'DELETE',
    });
  }

  @Get('pages/:slug')
  getPage(@Param('slug') slug: string) {
    return this.proxy.forward('catalog', `/pages/${slug}`);
  }

  @Put('pages/:slug')
  async updatePage(
    @Headers('authorization') authHeader: string,
    @Param('slug') slug: string,
    @Body() body: unknown,
  ) {
    await this.auth.requireAdmin(authHeader);
    return this.proxy.forward('catalog', `/pages/${slug}`, {
      method: 'PUT',
      data: body,
    });
  }

  @Get('availability/:entityId')
  availability(
    @Param('entityId') entityId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.proxy.forward(
      'booking',
      `/availability/${entityId}?from=${from}&to=${to}`,
    );
  }

  @Post('bookings')
  async createBooking(
    @Headers('authorization') authHeader: string,
    @Body() body: unknown,
  ) {
    const user = await this.auth.requireAuth(authHeader);
    return this.proxy.forward('booking', '/bookings', {
      method: 'POST',
      data: body,
      headers: {
        'x-user-id': user.sub,
        'x-user-role': user.role,
      },
    });
  }

  @Get('bookings/my')
  async myBookings(@Headers('authorization') authHeader: string) {
    const user = await this.auth.requireAuth(authHeader);
    return this.proxy.forward('booking', '/bookings/my', {
      headers: { 'x-user-id': user.sub },
    });
  }

  @Get('bookings')
  async allBookings(@Headers('authorization') authHeader: string) {
    const user = await this.auth.requireAdmin(authHeader);
    return this.proxy.forward('booking', '/bookings', {
      headers: { 'x-user-role': user.role },
    });
  }

  @Post('bookings/:id/cancel')
  async cancelBooking(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    const user = await this.auth.requireAuth(authHeader);
    return this.proxy.forward('booking', `/bookings/${id}/cancel`, {
      method: 'POST',
      headers: {
        'x-user-id': user.sub,
        'x-user-role': user.role,
      },
    });
  }

  @Post('payments')
  async createPayment(
    @Headers('authorization') authHeader: string,
    @Body() body: { bookingId: string; amount: number; description: string },
  ) {
    const user = await this.auth.requireAuth(authHeader);
    return this.proxy.forward('payment', '/payments', {
      method: 'POST',
      data: { ...body, userId: user.sub },
    });
  }

  @Get('payments/:id')
  async getPayment(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    await this.auth.requireAuth(authHeader);
    return this.proxy.forward('payment', `/payments/${id}`);
  }

  @Post('payments/:id/mock-complete')
  async mockComplete(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    await this.auth.requireAuth(authHeader);
    return this.proxy.forward('payment', `/payments/${id}/mock-complete`, {
      method: 'POST',
    });
  }

  @Post('webhook/yookassa')
  webhook(@Body() body: unknown) {
    return this.proxy.forward('payment', '/webhook/yookassa', {
      method: 'POST',
      data: body,
    });
  }
}
