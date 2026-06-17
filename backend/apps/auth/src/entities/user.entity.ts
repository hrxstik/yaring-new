import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import type { UserRole } from '@app/common';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'email', unique: true })
  phone!: string;

  @Column()
  passwordHash!: string;

  @Column()
  name!: string;

  @Column({ type: 'varchar', default: 'user' })
  role!: UserRole;

  @Column({ name: 'emailVerified', default: false })
  phoneVerified!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}
