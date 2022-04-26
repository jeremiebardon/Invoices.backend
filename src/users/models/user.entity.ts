import { IsEmail } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { Profile } from '@profile/models/profile.entity';

@Entity()
@Unique(['email', 'username'])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, type: 'varchar', nullable: true })
  username?: string;

  @Column({ type: 'varchar', nullable: false })
  @Exclude()
  password: string;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  resetPasswordExpires: Date;

  @Column({ type: 'varchar', nullable: false, unique: true })
  @IsEmail()
  email: string;

  @Column({ default: false })
  @Exclude()
  isActive: boolean;

  @Column({ default: null, nullable: true })
  @Exclude()
  confirmAccountToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  @Exclude()
  confirmAccountExpired: Date;

  @Column({ nullable: true, default: null })
  @Exclude()
  resetToken?: string;

  @OneToOne(() => Profile, (profile) => profile.user, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  profile: Profile;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
