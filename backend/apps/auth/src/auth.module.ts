import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { createDatabaseConfig, CacheModule } from '@app/common';
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
      createDatabaseConfig(
        process.env.AUTH_DB_URL ?? 'postgresql://yaring:yaring_secret@localhost:5432/auth_db',
        authEntities,
      ),
    ),
    TypeOrmModule.forFeature([UserEntity, VerificationCodeEntity]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'yaring-dev-secret-change-me',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      signOptions: { expiresIn: (process.env.JWT_ACCESS_EXPIRY ?? '15m') as any },
    }),
    CacheModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, SmsService],
})
export class AuthModule {}
