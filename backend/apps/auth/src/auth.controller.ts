import { Body, Controller, Get, Headers, Patch, Post, UseGuards } from '@nestjs/common';
import { createThrottle } from '@app/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  LogoutDto,
  RefreshDto,
  RegisterDto,
  ResendCodeDto,
  ResetPasswordConfirmDto,
  ResetPasswordRequestDto,
  UpdateProfileDto,
  VerifyPhoneDto,
} from './auth.dto';

const registerThrottle = createThrottle(5, 60_000);
const verifyThrottle   = createThrottle(10, 60_000);
const resendThrottle   = createThrottle(3, 300_000);
const loginThrottle    = createThrottle(10, 60_000);

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {
    void this.auth.ensureAdminSeed();
  }

  @UseGuards(registerThrottle)
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.phone, dto.password, dto.name);
  }

  @UseGuards(verifyThrottle)
  @Post('verify-phone')
  verifyPhone(@Body() dto: VerifyPhoneDto) {
    return this.auth.verifyPhone(dto.phone, dto.code);
  }

  @UseGuards(resendThrottle)
  @Post('resend-code')
  resendCode(@Body() dto: ResendCodeDto) {
    return this.auth.resendCode(dto.phone);
  }

  @UseGuards(loginThrottle)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.phone, dto.password);
  }

  @Post('test-user')
  createTestUser(@Body() dto: RegisterDto) {
    return this.auth.createTestUser(dto.phone, dto.password, dto.name);
  }

  @Get('me')
  me(@Headers('authorization') authHeader?: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return null;
    return this.auth.validateToken(token).then((p) => this.auth.me(p.sub));
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.userId, dto.refreshToken);
  }

  @Post('logout')
  logout(
    @Body() dto: LogoutDto,
    @Headers('authorization') authHeader?: string,
  ) {
    const accessToken = authHeader?.replace('Bearer ', '');
    return this.auth.logout(dto.userId, dto.refreshToken, accessToken);
  }

  @Post('logout-all')
  logoutAll(
    @Body('userId') userId: string,
    @Headers('authorization') authHeader?: string,
  ) {
    const accessToken = authHeader?.replace('Bearer ', '');
    return this.auth.logoutAll(userId, accessToken);
  }

  @Patch('profile')
  updateProfile(
    @Headers('authorization') authHeader?: string,
    @Body() dto?: UpdateProfileDto,
  ) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token || !dto) return null;
    return this.auth.validateToken(token).then((p) => this.auth.updateProfile(p.sub, dto.name));
  }

  @UseGuards(resendThrottle)
  @Post('reset-password/request')
  resetPasswordRequest(@Body() dto: ResetPasswordRequestDto) {
    return this.auth.requestPasswordReset(dto.phone);
  }

  @UseGuards(verifyThrottle)
  @Post('reset-password/confirm')
  resetPasswordConfirm(@Body() dto: ResetPasswordConfirmDto) {
    return this.auth.confirmPasswordReset(dto.phone, dto.code, dto.newPassword);
  }

  @Post('validate')
  validate(@Body('token') token: string) {
    return this.auth.validateToken(token);
  }
}
