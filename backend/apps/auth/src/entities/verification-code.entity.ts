import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('verification_codes')
export class VerificationCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'email' })
  phone!: string;

  @Column()
  code!: string;

  @Column({ default: 'registration' })
  purpose!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  expiresAt!: Date;
}
