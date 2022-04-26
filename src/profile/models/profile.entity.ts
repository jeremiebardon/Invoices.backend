import { IsString } from 'class-validator';
import { User } from '@users/models/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  @IsString()
  photo: string;

  @Column({ type: 'varchar', nullable: true })
  @IsString()
  firstName?: string;

  @Column({ type: 'varchar', nullable: true })
  @IsString()
  lastName?: string;

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
