import { Module } from '@nestjs/common';
import Redis from 'ioredis';
import { CacheService, REDIS_CLIENT } from './cache.service';

@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () =>
        new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
          lazyConnect: true,
          maxRetriesPerRequest: 3,
        }),
    },
    CacheService,
  ],
  exports: [CacheService],
})
export class CacheModule {}
