import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import {
  BOOKING_RULES,
  daysBetween,
  timeToMinutes,
} from '@app/common';
import { BookingRecord } from './entities/booking.entity';
import type { CreateBookingDto } from './booking.dto';

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
    const bookings = await this.bookings.find({
      where: {
        entityId,
        status: 'confirmed' as const,
      },
    });

    const blockedDates = new Set<string>();
    const blockedSlots: { date: string; startTime: string; endTime: string }[] =
      [];

    for (const b of bookings) {
      if (b.bookingType === 'daily') {
        let current = b.startDate;
        while (current <= b.endDate) {
          blockedDates.add(current);
          const d = new Date(current);
          d.setDate(d.getDate() + 1);
          current = d.toISOString().slice(0, 10);
        }
      } else if (b.startTime && b.endTime) {
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

  private validateDates(dto: CreateBookingDto, bookingType: string) {
    if (dto.endDate < dto.startDate) {
      throw new BadRequestException('Дата выезда раньше заезда');
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
    const existing = await this.bookings.find({
      where: { entityId: dto.entityId, status: 'confirmed' as const },
    });

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
    const { data } = await axios.get(`${catalogUrl}/entities/${entityId}`);
    return data;
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
