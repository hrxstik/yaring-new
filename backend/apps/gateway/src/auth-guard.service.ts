import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import axios from 'axios';
import type { JwtPayload } from '@app/common';

@Injectable()
export class AuthGuardService {
  private readonly authUrl =
    process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001';

  async validate(authHeader?: string): Promise<JwtPayload | null> {
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.slice(7);
    try {
      const { data } = await axios.post(`${this.authUrl}/validate`, {
        token,
      });
      return data as JwtPayload;
    } catch {
      throw new UnauthorizedException('Недействительный токен');
    }
  }

  requireAuth(authHeader?: string): Promise<JwtPayload> {
    return this.validate(authHeader).then((payload) => {
      if (!payload) throw new UnauthorizedException('Требуется авторизация');
      return payload;
    });
  }

  requireAdmin(authHeader?: string): Promise<JwtPayload> {
    return this.requireAuth(authHeader).then((payload) => {
      if (payload.role !== 'admin') {
        throw new ForbiddenException('Требуются права администратора');
      }
      return payload;
    });
  }
}
