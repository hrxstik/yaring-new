import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import type { BookingStatus, BookingType } from '@app/common';

@Entity('bookings')
export class BookingRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  entityId!: string;

  @Column()
  entityName!: string;

  @Column({ type: 'varchar' })
  bookingType!: BookingType;

  @Column()
  startDate!: string;

  @Column()
  endDate!: string;

  @Column({ nullable: true })
  startTime?: string;

  @Column({ nullable: true })
  endTime?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice!: number;

  @Column({ type: 'varchar', default: 'pending_payment' })
  status!: BookingStatus;

  @Column({ nullable: true })
  paymentId?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
