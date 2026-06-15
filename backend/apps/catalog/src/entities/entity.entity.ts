import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { BookingType } from '@app/common';

@Entity('bookable_entities')
export class EntityRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  slug!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ type: 'varchar' })
  bookingType!: BookingType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  pricePerDay!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  pricePerHour?: number;

  @Column({ default: 1 })
  capacity!: number;

  @Column({ type: 'simple-json', default: '[]' })
  amenities!: string[];

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
