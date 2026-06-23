import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CacheService } from '@app/common';
import type { JwtPayload } from '@app/common';

@Injectable()
export class AuthGuardService {
  constructor(
    private readonly jwt: JwtService,
    private readonly cache: CacheService,
  ) {}

  async validate(authHeader?: string): Promise<JwtPayload | null> {
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7);
    let payload: JwtPayload & { jti?: string };
    try {
      payload = this.jwt.verify<JwtPayload & { jti?: string }>(token);
    } catch {
      throw new UnauthorizedException('Недействительный токен');
    }

    if (payload.jti) {
      const revoked = await this.cache.get(`revoked-access:${payload.jti}`);
      if (revoked) throw new UnauthorizedException('Токен отозван');
    }

    return payload;
  }

  async requireAuth(authHeader?: string): Promise<JwtPayload> {
    const payload = await this.validate(authHeader);
    if (!payload) throw new UnauthorizedException('Требуется авторизация');
    return payload;
  }

  async requireAdmin(authHeader?: string): Promise<JwtPayload> {
    const payload = await this.requireAuth(authHeader);
    if (payload.role !== 'admin') {
      throw new ForbiddenException('Требуются права администратора');
    }
    return payload;
  }
}
