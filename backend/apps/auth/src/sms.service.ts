import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(private readonly config: ConfigService) {}

  async sendVerificationCode(phone: string, code: string): Promise<void> {
    const apiId = this.config.get<string>('SMS_RU_API_ID');
    const sender = this.config.get<string>('SMS_RU_SENDER');
    const message = `Код подтверждения Яринг: ${code}`;

    if (!apiId) {
      this.logger.warn(
        `SMS_RU_API_ID не задан. Код для телефона ${phone}: ${code}`,
      );
      return;
    }

    await axios.get('https://sms.ru/sms/send', {
      params: {
        api_id: apiId,
        to: phone,
        msg: message,
        from: sender || undefined,
        json: 1,
      },
    });
  }
}
