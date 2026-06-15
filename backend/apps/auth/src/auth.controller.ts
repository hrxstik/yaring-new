import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  ResendCodeDto,
  VerifyEmailDto,
} from './auth.dto';

@Controller()
export class AuthController {
  constructor(private readonly auth: AuthService) {
    void this.auth.ensureAdminSeed();
  }

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto.email, dto.password, dto.name);
  }

  @Post('verify-email')
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.auth.verifyEmail(dto.email, dto.code);
  }

  @Post('resend-code')
  resendCode(@Body() dto: ResendCodeDto) {
    return this.auth.resendCode(dto.email);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Get('me')
  me(@Headers('authorization') authHeader?: string) {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) return null;
    const payload = this.auth.validateToken(token);
    return payload.then((p) => this.auth.me(p.sub));
  }

  @Post('validate')
  validate(@Body('token') token: string) {
    return this.auth.validateToken(token);
  }
}
