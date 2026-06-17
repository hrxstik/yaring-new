import { HttpException, Injectable } from '@nestjs/common';
import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

@Injectable()
export class ProxyService {
  private readonly services = {
    auth: process.env.AUTH_SERVICE_URL ?? 'http://localhost:3001',
    catalog: process.env.CATALOG_SERVICE_URL ?? 'http://localhost:3002',
    booking: process.env.BOOKING_SERVICE_URL ?? 'http://localhost:3003',
    payment: process.env.PAYMENT_SERVICE_URL ?? 'http://localhost:3004',
  };

  async forward(
    service: keyof typeof this.services,
    path: string,
    config: AxiosRequestConfig = {},
  ) {
    const url = `${this.services[service]}${path}`;
    try {
      const { data } = await axios({ url, ...config });
      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }
      throw error;
    }
  }
}
