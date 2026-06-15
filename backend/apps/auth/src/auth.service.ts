import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserEntity } from './entities/user.entity';
import { VerificationCodeEntity } from './entities/verification-code.entity';
import { EmailService } from './email.service';
import type { JwtPayload } from '@app/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(VerificationCodeEntity)
    private readonly codes: Repository<VerificationCodeEntity>,
    private readonly jwt: JwtService,
    private readonly email: EmailService,
  ) {}

  async register(email: string, password: string, name: string) {
    const normalized = email.toLowerCase().trim();
    const existing = await this.users.findOne({ where: { email: normalized } });
    if (existing?.emailVerified) {
      throw new ConflictException('Пользователь уже зарегистрирован');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let user = existing;
    if (!user) {
      user = this.users.create({
        email: normalized,
        passwordHash,
        name: name.trim(),
        role: 'user',
        emailVerified: false,
      });
    } else {
      user.passwordHash = passwordHash;
      user.name = name.trim();
    }
    await this.users.save(user);
    await this.sendCode(normalized, 'registration');
    return { message: 'Код подтверждения отправлен на почту' };
  }

  async verifyEmail(email: string, code: string) {
    const normalized = email.toLowerCase().trim();
    await this.validateCode(normalized, code, 'registration');
    const user = await this.users.findOne({ where: { email: normalized } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    user.emailVerified = true;
    await this.users.save(user);
    await this.codes.delete({ email: normalized, purpose: 'registration' });
    return this.issueTokens(user);
  }

  async login(email: string, password: string) {
    const normalized = email.toLowerCase().trim();
    const user = await this.users.findOne({ where: { email: normalized } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Неверный email или пароль');
    }
    if (!user.emailVerified) {
      throw new UnauthorizedException('Подтвердите email перед входом');
    }
    return this.issueTokens(user);
  }

  async me(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return this.toProfile(user);
  }

  async resendCode(email: string) {
    const normalized = email.toLowerCase().trim();
    const user = await this.users.findOne({ where: { email: normalized } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    if (user.emailVerified) {
      throw new BadRequestException('Email уже подтверждён');
    }
    await this.sendCode(normalized, 'registration');
    return { message: 'Код отправлен повторно' };
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwt.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Недействительный токен');
    }
  }

  async ensureAdminSeed() {
    const adminEmail = (process.env.ADMIN_EMAIL ?? 'admin@yaring.ru').toLowerCase();
    const existing = await this.users.findOne({ where: { email: adminEmail } });
    if (existing) return;
    const passwordHash = await bcrypt.hash(
      process.env.ADMIN_PASSWORD ?? 'admin123',
      10,
    );
    await this.users.save(
      this.users.create({
        email: adminEmail,
        passwordHash,
        name: 'Администратор',
        role: 'admin',
        emailVerified: true,
      }),
    );
  }

  private async sendCode(email: string, purpose: string) {
    await this.codes.delete({ email, purpose });
    await this.codes.delete({
      expiresAt: LessThan(new Date()),
    });
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await this.codes.save(
      this.codes.create({ email, code, purpose, expiresAt }),
    );
    await this.email.sendVerificationCode(email, code);
  }

  private async validateCode(email: string, code: string, purpose: string) {
    const record = await this.codes.findOne({
      where: { email, code, purpose },
      order: { createdAt: 'DESC' },
    });
    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException('Неверный или просроченный код');
    }
  }

  private issueTokens(user: UserEntity) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return {
      accessToken: this.jwt.sign(payload),
      user: this.toProfile(user),
    };
  }

  private toProfile(user: UserEntity) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
