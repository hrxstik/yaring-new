import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class InternalGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const secret = process.env.INTERNAL_SERVICE_SECRET;
    if (!secret) return true; // guard is opt-in via env

    const req = ctx.switchToHttp().getRequest<Request>();
    if (req.headers['x-internal-secret'] !== secret) {
      throw new ForbiddenException('Internal access only');
    }
    return true;
  }
}
