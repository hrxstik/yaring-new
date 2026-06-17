import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { createSqlJsConfig } from '@app/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SmsService } from './sms.service';
import { UserEntity } from './entities/user.entity';
import { VerificationCodeEntity } from './entities/verification-code.entity';

const authEntities = [UserEntity, VerificationCodeEntity];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(
      createSqlJsConfig(process.env.AUTH_DB ?? 'data/auth.sqljs', authEntities),
    ),
    TypeOrmModule.forFeature([UserEntity, VerificationCodeEntity]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'yaring-dev-secret-change-me',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, SmsService],
})
export class AuthModule {}
