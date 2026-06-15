import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendVerificationCode(email: string, code: string): Promise<void> {
    const apiKey = this.config.get<string>('UNISENDER_API_KEY');
    const fromEmail = this.config.get<string>(
      'EMAIL_FROM',
      'noreply@yaring.ru',
    );
    const fromName = this.config.get<string>('EMAIL_FROM_NAME', 'Яринг');

    const subject = 'Код подтверждения — Яринг';
    const body = `Ваш код подтверждения: ${code}\n\nКод действителен 15 минут.`;

    if (!apiKey) {
      this.logger.warn(
        `UNISENDER_API_KEY не задан. Код для ${email}: ${code}`,
      );
      return;
    }

    await axios.post(
      'https://goapi.unisender.ru/ru/transactional/api/v1/email/send.json',
      {
        message: {
          recipients: [{ email }],
          body: {
            html: `<p>Ваш код подтверждения: <strong>${code}</strong></p><p>Код действителен 15 минут.</p>`,
            plaintext: body,
          },
          subject,
          from_email: fromEmail,
          from_name: fromName,
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey,
        },
      },
    );
  }
}
