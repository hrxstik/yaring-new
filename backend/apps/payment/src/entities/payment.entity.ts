import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import type { PaymentStatus } from '@app/common';

@Entity('payments')
export class PaymentRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  bookingId!: string;

  @Column()
  userId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount!: number;

  @Column({ type: 'varchar', default: 'pending' })
  status!: PaymentStatus;

  @Column({ nullable: true })
  yookassaPaymentId?: string;

  @Column({ nullable: true })
  confirmationUrl?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
