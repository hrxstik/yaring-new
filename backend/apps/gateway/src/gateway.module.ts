import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GatewayController } from './gateway.controller';
import { ProxyService } from './proxy.service';
import { AuthGuardService } from './auth-guard.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [GatewayController],
  providers: [ProxyService, AuthGuardService],
})
export class GatewayModule {}
