import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from '@app/common';

@Injectable()
export class AuthGuardService {
  constructor(private readonly jwt: JwtService) {}

  validate(authHeader?: string): JwtPayload | null {
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7);
    try {
      return this.jwt.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Недействительный токен');
    }
  }

  requireAuth(authHeader?: string): JwtPayload {
    const payload = this.validate(authHeader);
    if (!payload) throw new UnauthorizedException('Требуется авторизация');
    return payload;
  }

  requireAdmin(authHeader?: string): JwtPayload {
    const payload = this.requireAuth(authHeader);
    if (payload.role !== 'admin') {
      throw new ForbiddenException('Требуются права администратора');
    }
    return payload;
  }
}
