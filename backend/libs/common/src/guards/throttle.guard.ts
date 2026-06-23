import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

interface BucketEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class ThrottleGuard implements CanActivate {
  private readonly buckets = new Map<string, BucketEntry>();
  private readonly limit: number;
  private readonly windowMs: number;

  constructor(limit = 5, windowMs = 60_000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      'unknown';
    const key = `${req.path}::${ip}`;
    const now = Date.now();

    let entry = this.buckets.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + this.windowMs };
      this.buckets.set(key, entry);
    }

    entry.count += 1;
    if (entry.count > this.limit) {
      throw new HttpException(
        `Слишком много запросов. Попробуйте через ${Math.ceil((entry.resetAt - now) / 1000)} с.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}

export function createThrottle(limit: number, windowMs: number) {
  return new ThrottleGuard(limit, windowMs);
}
