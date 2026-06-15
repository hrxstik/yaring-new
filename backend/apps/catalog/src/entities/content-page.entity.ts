import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
} from 'typeorm';

@Entity('content_pages')
export class ContentPageRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  slug!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  body!: string;

  @UpdateDateColumn()
  updatedAt!: Date;
}
