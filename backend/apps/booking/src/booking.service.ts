import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  BadGatewayException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import axios, { AxiosError } from 'axios';
import {
  BOOKING_RULES,
  daysBetween,
  parseIsoDate,
  timeToMinutes,
} from '@app/common';
import { BookingRecord } from './entities/booking.entity';
import type { CreateBookingDto } from './booking.dto';

const PENDING_PAYMENT_TTL_MS = 15 * 60 * 1000;

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(BookingRecord)
    private readonly bookings: Repository<BookingRecord>,
  ) {}

  async create(userId: string, dto: CreateBookingDto) {
    const entity = await this.fetchEntity(dto.entityId);
    if (!entity.isActive) {
      throw new BadRequestException('Объект недоступен для бронирования');
    }

    this.validateDates(dto, entity.bookingType);
    await this.checkAvailability(dto, entity.bookingType);

    const totalPrice = this.calculatePrice(dto, entity);
    const booking = this.bookings.create({
      userId,
      entityId: entity.id,
      entityName: entity.name,
      bookingType: entity.bookingType,
      startDate: dto.startDate,
      endDate: dto.endDate,
      startTime: dto.startTime,
      endTime: dto.endTime,
      totalPrice,
      status: 'pending_payment',
    });
    await this.bookings.save(booking);
    return this.toBooking(booking);
  }

  async getById(id: string) {
    const booking = await this.bookings.findOne({ where: { id } });
    if (!booking) throw new NotFoundException('Бронь не найдена');
    return this.toBooking(booking);
  }

  async listByUser(userId: string) {
    const items = await this.bookings.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return items.map((b) => this.toBooking(b));
  }

  async listAll() {
    const items = await this.bookings.find({ order: { createdAt: 'DESC' } });
    return items.map((b) => this.toBooking(b));
  }

  async getAvailability(entityId: string, from: string, to: string) {
    const bookings = await this.getBlockingBookings(entityId);

    const blockedDates = new Set<string>();
    const blockedSlots: { date: string; startTime: string; endTime: string }[] =
      [];

    for (const b of bookings) {
      if (b.bookingType === 'daily') {
        let current = b.startDate;
        while (current <= b.endDate) {
          if (this.isWithinRange(current, from, to)) {
            blockedDates.add(current);
          }
          const d = parseIsoDate(current);
          if (!d) break;
          d.setDate(d.getDate() + 1);
          current = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        }
      } else if (b.startTime && b.endTime && this.isWithinRange(b.startDate, from, to)) {
        blockedSlots.push({
          date: b.startDate,
          startTime: b.startTime,
          endTime: b.endTime,
        });
      }
    }

    return { blockedDates: [...blockedDates], blockedSlots };
  }

  async confirmPayment(bookingId: string, paymentId: string) {
    const booking = await this.bookings.findOne({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Бронь не найдена');
    if (booking.status === 'cancelled') {
      throw new BadRequestException('Бронь отменена');
    }
    booking.status = 'confirmed';
    booking.paymentId = paymentId;
    await this.bookings.save(booking);
    return this.toBooking(booking);
  }

  async cancel(bookingId: string, userId: string, isAdmin: boolean) {
    const booking = await this.bookings.findOne({ where: { id: bookingId } });
    if (!booking) throw new NotFoundException('Бронь не найдена');
    if (!isAdmin && booking.userId !== userId) {
      throw new BadRequestException('Нет доступа');
    }
    booking.status = 'cancelled';
    await this.bookings.save(booking);
    return this.toBooking(booking);
  }

  private async getBlockingBookings(entityId: string) {
    const bookings = await this.bookings.find({
      where: {
        entityId,
        status: In(['confirmed', 'pending_payment']),
      },
    });
    return bookings.filter((b) => this.isBlockingBooking(b));
  }

  private isBlockingBooking(booking: BookingRecord) {
    if (booking.status === 'confirmed') return true;
    if (booking.status === 'pending_payment') {
      return Date.now() - booking.createdAt.getTime() < PENDING_PAYMENT_TTL_MS;
    }
    return false;
  }

  private isWithinRange(date: string, from: string, to: string) {
    if (!from && !to) return true;
    if (from && date < from) return false;
    if (to && date > to) return false;
    return true;
  }

  private validateDates(dto: CreateBookingDto, bookingType: string) {
    if (dto.endDate < dto.startDate) {
      throw new BadRequestException('Дата выезда раньше заезда');
    }

    const start = parseIsoDate(dto.startDate);
    if (!start) {
      throw new BadRequestException('Некорректная дата начала');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const minStart = new Date(today);
    minStart.setDate(minStart.getDate() + BOOKING_RULES.minAdvanceDays);

    const maxStart = new Date(today);
    maxStart.setDate(maxStart.getDate() + BOOKING_RULES.maxAdvanceDays);

    if (start < minStart) {
      throw new BadRequestException(
        `Бронирование возможно не ранее чем за ${BOOKING_RULES.minAdvanceDays} дн.`,
      );
    }
    if (start > maxStart) {
      throw new BadRequestException(
        `Бронирование возможно не более чем на ${BOOKING_RULES.maxAdvanceDays} дн. вперёд`,
      );
    }

    if (bookingType === 'hourly') {
      if (!dto.startTime || !dto.endTime) {
        throw new BadRequestException('Укажите время для почасового бронирования');
      }
      if (dto.startDate !== dto.endDate) {
        throw new BadRequestException(
          'Почасовое бронирование — в пределах одного дня',
        );
      }
      const startMin = timeToMinutes(dto.startTime);
      const endMin = timeToMinutes(dto.endTime);
      if (endMin <= startMin) {
        throw new BadRequestException('Время окончания должно быть позже начала');
      }
      const hours = (endMin - startMin) / 60;
      if (hours < BOOKING_RULES.hourlyMinHours) {
        throw new BadRequestException(
          `Минимум ${BOOKING_RULES.hourlyMinHours} ч.`,
        );
      }
      if (hours > BOOKING_RULES.hourlyMaxHours) {
        throw new BadRequestException(
          `Максимум ${BOOKING_RULES.hourlyMaxHours} ч.`,
        );
      }
    }
  }

  private async checkAvailability(
    dto: CreateBookingDto,
    bookingType: string,
  ) {
    const existing = await this.getBlockingBookings(dto.entityId);

    for (const b of existing) {
      if (bookingType === 'daily') {
        const overlap =
          dto.startDate <= b.endDate && dto.endDate >= b.startDate;
        if (overlap) {
          throw new ConflictException('Выбранные даты заняты');
        }
      } else if (
        b.startDate === dto.startDate &&
        b.startTime &&
        b.endTime &&
        dto.startTime &&
        dto.endTime
      ) {
        const overlap =
          timeToMinutes(dto.startTime) < timeToMinutes(b.endTime) &&
          timeToMinutes(dto.endTime) > timeToMinutes(b.startTime);
        if (overlap) {
          throw new ConflictException('Выбранное время занято');
        }
      }
    }
  }

  private calculatePrice(
    dto: CreateBookingDto,
    entity: { bookingType: string; pricePerDay: number; pricePerHour?: number },
  ) {
    if (entity.bookingType === 'daily') {
      const days = Math.max(1, daysBetween(dto.startDate, dto.endDate) + 1);
      return days * entity.pricePerDay;
    }
    const startMin = timeToMinutes(dto.startTime!);
    const endMin = timeToMinutes(dto.endTime!);
    const hours = (endMin - startMin) / 60;
    return hours * (entity.pricePerHour ?? 0);
  }

  private async fetchEntity(entityId: string) {
    const catalogUrl =
      process.env.CATALOG_SERVICE_URL ?? 'http://localhost:3002';
    try {
      const { data } = await axios.get(`${catalogUrl}/entities/${entityId}`);
      return data;
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 404) {
        throw new NotFoundException('Объект не найден');
      }
      throw new BadGatewayException('Сервис каталога недоступен');
    }
  }

  private toBooking(booking: BookingRecord) {
    return {
      id: booking.id,
      userId: booking.userId,
      entityId: booking.entityId,
      entityName: booking.entityName,
      bookingType: booking.bookingType,
      startDate: booking.startDate,
      endDate: booking.endDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalPrice: Number(booking.totalPrice),
      status: booking.status,
      paymentId: booking.paymentId,
      createdAt: booking.createdAt.toISOString(),
    };
  }
}
