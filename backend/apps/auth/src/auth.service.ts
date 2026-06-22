import { randomInt } from 'crypto';
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
import { SmsService } from './sms.service';
import type { JwtPayload } from '@app/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(VerificationCodeEntity)
    private readonly codes: Repository<VerificationCodeEntity>,
    private readonly jwt: JwtService,
    private readonly sms: SmsService,
  ) {}

  async register(phone: string, password: string, name: string) {
    const normalized = this.normalizePhone(phone);
    const existing = await this.users.findOne({ where: { phone: normalized } });
    if (existing?.phoneVerified) {
      throw new ConflictException('Пользователь уже зарегистрирован');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    let user = existing;
    if (!user) {
      user = this.users.create({
        phone: normalized,
        passwordHash,
        name: name.trim(),
        role: 'user',
        phoneVerified: false,
      });
    } else {
      user.passwordHash = passwordHash;
      user.name = name.trim();
    }
    await this.users.save(user);
    await this.sendCode(normalized, 'registration');
    return { message: 'Код подтверждения отправлен по SMS' };
  }

  async verifyPhone(phone: string, code: string) {
    const normalized = this.normalizePhone(phone);
    await this.validateCode(normalized, code, 'registration');
    const user = await this.users.findOne({ where: { phone: normalized } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    user.phoneVerified = true;
    await this.users.save(user);
    await this.codes.delete({ phone: normalized, purpose: 'registration' });
    return this.issueTokens(user);
  }

  async login(phone: string, password: string) {
    const normalized = this.normalizePhone(phone);
    const user = await this.users.findOne({ where: { phone: normalized } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('Неверный телефон или пароль');
    }
    if (!user.phoneVerified) {
      throw new UnauthorizedException('Подтвердите телефон перед входом');
    }
    return this.issueTokens(user);
  }

  async createTestUser(phone: string, password: string, name: string) {
    if (process.env.E2E_TEST_MODE !== '1') {
      throw new NotFoundException('Not found');
    }

    const normalized = this.normalizePhone(phone);
    const passwordHash = await bcrypt.hash(password, 10);
    let user = await this.users.findOne({ where: { phone: normalized } });

    if (!user) {
      user = this.users.create({
        phone: normalized,
        passwordHash,
        name: name.trim(),
        role: 'user',
        phoneVerified: true,
      });
    } else {
      user.passwordHash = passwordHash;
      user.name = name.trim();
      user.phoneVerified = true;
      user.role = 'user';
    }

    await this.users.save(user);
    return this.issueTokens(user);
  }

  async me(userId: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    return this.toProfile(user);
  }

  async resendCode(phone: string) {
    const normalized = this.normalizePhone(phone);
    const user = await this.users.findOne({ where: { phone: normalized } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    if (user.phoneVerified) {
      throw new BadRequestException('Телефон уже подтверждён');
    }
    await this.sendCode(normalized, 'registration');
    return { message: 'Код отправлен повторно' };
  }

  async updateProfile(userId: string, name: string) {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('Пользователь не найден');
    user.name = name.trim();
    await this.users.save(user);
    return this.toProfile(user);
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwt.verify<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Недействительный токен');
    }
  }

  async ensureAdminSeed() {
    const adminPhone = this.normalizePhone(process.env.ADMIN_PHONE ?? '+79990000000');
    const existing = await this.users.findOne({ where: { phone: adminPhone } });
    if (existing) return;
    const passwordHash = await bcrypt.hash(
      process.env.ADMIN_PASSWORD ?? 'admin123',
      10,
    );
    await this.users.save(
      this.users.create({
        phone: adminPhone,
        passwordHash,
        name: 'Администратор',
        role: 'admin',
        phoneVerified: true,
      }),
    );
  }

  private async sendCode(phone: string, purpose: string) {
    await this.codes.delete({ phone, purpose });
    await this.codes.delete({
      expiresAt: LessThan(new Date()),
    });
    const code = String(randomInt(100000, 1000000));
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await this.codes.save(
      this.codes.create({ phone, code, purpose, expiresAt }),
    );
    await this.sms.sendVerificationCode(phone, code);
  }

  private async validateCode(phone: string, code: string, purpose: string) {
    const record = await this.codes.findOne({
      where: { phone, code, purpose },
      order: { createdAt: 'DESC' },
    });
    if (!record || record.expiresAt < new Date()) {
      throw new BadRequestException('Неверный или просроченный код');
    }
  }

  private issueTokens(user: UserEntity) {
    const payload: JwtPayload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
    };
    return {
      accessToken: this.jwt.sign(payload),
      user: this.toProfile(user),
    };
  }

  private normalizePhone(phone: string) {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) return `7${digits}`;
    if (digits.length === 11 && digits.startsWith('8')) return `7${digits.slice(1)}`;
    if (digits.length === 11 && digits.startsWith('7')) return digits;
    throw new BadRequestException('Укажите телефон в формате +7XXXXXXXXXX');
  }

  private toProfile(user: UserEntity) {
    return {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      phoneVerified: user.phoneVerified,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
