import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  NotFoundException,
  Param,
  Patch,
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
    return this.proxy.forward('auth', '/register', { method: 'POST', data: body });
  }

  @Post('auth/verify-phone')
  verifyPhone(@Body() body: unknown) {
    return this.proxy.forward('auth', '/verify-phone', { method: 'POST', data: body });
  }

  @Post('auth/resend-code')
  resendCode(@Body() body: unknown) {
    return this.proxy.forward('auth', '/resend-code', { method: 'POST', data: body });
  }

  @Post('auth/login')
  login(@Body() body: unknown) {
    return this.proxy.forward('auth', '/login', { method: 'POST', data: body });
  }

  @Post('auth/test-user')
  createTestUser(@Body() body: unknown) {
    if (process.env.E2E_TEST_MODE !== '1') throw new NotFoundException();
    return this.proxy.forward('auth', '/test-user', { method: 'POST', data: body });
  }

  @Get('auth/me')
  me(@Headers('authorization') authHeader?: string) {
    this.auth.requireAuth(authHeader);
    return this.proxy.forward('auth', '/me', {
      headers: { Authorization: authHeader! },
    });
  }

  @Patch('auth/profile')
  updateProfile(
    @Headers('authorization') authHeader: string,
    @Body() body: unknown,
  ) {
    this.auth.requireAuth(authHeader);
    return this.proxy.forward('auth', '/profile', {
      method: 'PATCH',
      data: body,
      headers: { Authorization: authHeader },
    });
  }

  @Post('auth/reset-password/request')
  resetPasswordRequest(@Body() body: unknown) {
    return this.proxy.forward('auth', '/reset-password/request', { method: 'POST', data: body });
  }

  @Post('auth/reset-password/confirm')
  resetPasswordConfirm(@Body() body: unknown) {
    return this.proxy.forward('auth', '/reset-password/confirm', { method: 'POST', data: body });
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
  createEntity(
    @Headers('authorization') authHeader: string,
    @Body() body: unknown,
  ) {
    this.auth.requireAdmin(authHeader);
    return this.proxy.forward('catalog', '/entities', { method: 'POST', data: body });
  }

  @Put('entities/:id')
  updateEntity(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    this.auth.requireAdmin(authHeader);
    return this.proxy.forward('catalog', `/entities/${id}`, { method: 'PUT', data: body });
  }

  @Delete('entities/:id')
  deleteEntity(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    this.auth.requireAdmin(authHeader);
    return this.proxy.forward('catalog', `/entities/${id}`, { method: 'DELETE' });
  }

  @Get('pages/:slug')
  getPage(@Param('slug') slug: string) {
    return this.proxy.forward('catalog', `/pages/${slug}`);
  }

  @Put('pages/:slug')
  updatePage(
    @Headers('authorization') authHeader: string,
    @Param('slug') slug: string,
    @Body() body: unknown,
  ) {
    this.auth.requireAdmin(authHeader);
    return this.proxy.forward('catalog', `/pages/${slug}`, { method: 'PUT', data: body });
  }

  @Get('availability/:entityId')
  availability(
    @Param('entityId') entityId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.proxy.forward('booking', `/availability/${entityId}?from=${from}&to=${to}`);
  }

  @Post('bookings')
  createBooking(
    @Headers('authorization') authHeader: string,
    @Body() body: unknown,
  ) {
    const user = this.auth.requireAuth(authHeader);
    return this.proxy.forward('booking', '/bookings', {
      method: 'POST',
      data: body,
      headers: { 'x-user-id': user.sub, 'x-user-role': user.role },
    });
  }

  @Get('bookings/my')
  myBookings(@Headers('authorization') authHeader: string) {
    const user = this.auth.requireAuth(authHeader);
    return this.proxy.forward('booking', '/bookings/my', {
      headers: { 'x-user-id': user.sub },
    });
  }

  @Get('bookings')
  allBookings(@Headers('authorization') authHeader: string) {
    const user = this.auth.requireAdmin(authHeader);
    return this.proxy.forward('booking', '/bookings', {
      headers: { 'x-user-role': user.role },
    });
  }

  @Post('bookings/:id/cancel')
  cancelBooking(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    const user = this.auth.requireAuth(authHeader);
    return this.proxy.forward('booking', `/bookings/${id}/cancel`, {
      method: 'POST',
      headers: { 'x-user-id': user.sub, 'x-user-role': user.role },
    });
  }

  @Post('bookings/:id/cancel-refund')
  cancelWithRefund(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    const user = this.auth.requireAuth(authHeader);
    return this.proxy.forward('payment', `/bookings/${id}/cancel-refund`, {
      method: 'POST',
      headers: { 'x-user-id': user.sub, 'x-user-role': user.role },
    });
  }

  @Post('payments')
  createPayment(
    @Headers('authorization') authHeader: string,
    @Body() body: { bookingId: string; amount: number; description: string },
  ) {
    const user = this.auth.requireAuth(authHeader);
    return this.proxy.forward('payment', '/payments', {
      method: 'POST',
      data: { ...body, userId: user.sub },
    });
  }

  @Get('payments/:id')
  getPayment(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    const user = this.auth.requireAuth(authHeader);
    return this.proxy.forward('payment', `/payments/${id}`, {
      headers: { 'x-user-id': user.sub },
    });
  }

  @Post('payments/:id/mock-complete')
  mockComplete(
    @Headers('authorization') authHeader: string,
    @Param('id') id: string,
  ) {
    const user = this.auth.requireAuth(authHeader);
    return this.proxy.forward('payment', `/payments/${id}/mock-complete`, {
      method: 'POST',
      headers: { 'x-user-id': user.sub },
    });
  }

  @Post('webhook/yookassa')
  webhook(@Body() body: unknown) {
    return this.proxy.forward('payment', '/webhook/yookassa', { method: 'POST', data: body });
  }
}
