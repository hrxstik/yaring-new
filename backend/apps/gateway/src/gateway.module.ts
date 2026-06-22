import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { GatewayController } from './gateway.controller';
import { ProxyService } from './proxy.service';
import { AuthGuardService } from './auth-guard.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'yaring-dev-secret-change-me',
    }),
  ],
  controllers: [GatewayController],
  providers: [ProxyService, AuthGuardService],
})
export class GatewayModule {}
