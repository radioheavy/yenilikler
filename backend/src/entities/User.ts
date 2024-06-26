import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsEmail, MinLength, MaxLength, IsIP } from 'class-validator';

@Entity('users')
export class User {
  [key: string]: any; // Dinamik indeksleme için tür tanımı

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Column()
  @MinLength(8)
  @MaxLength(100)
  password!: string;

  @Column()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @Column()
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;

  @Column({ nullable: true })
  @MaxLength(15)
  phoneNumber?: string;

  @Column({ default: false })
  isEmailVerified!: boolean;

  @Column({ default: 'user' })
  role!: string;

  @Column({ nullable: true, type: 'timestamp' })
  lastLoginAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true, type: 'varchar' })
  emailVerificationToken?: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  emailVerificationTokenExpires?: Date | null;

  @Column({ nullable: true, type: 'varchar' })
  resetPasswordToken?: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  resetPasswordTokenExpires?: Date | null;

  @Column({ nullable: true, type: 'varchar' })
  twoFactorSecret?: string | null;

  @Column({ default: false })
  isTwoFactorEnabled!: boolean;

  @Column({ nullable: true })
  googleId?: string;

  @Column({ nullable: true })
  facebookId?: string;

  @Column({ nullable: true })
  @IsIP()
  registrationIp?: string;

  @Column({ type: 'simple-array', default: [] })
  loginIps: string[] = [];

  async validatePassword(password: string): Promise<boolean> {
    const bcrypt = require('bcrypt'); // bcrypt'i burada import ediyoruz
    return bcrypt.compare(password, this.password);
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.getFullName(),
      phoneNumber: this.phoneNumber,
      role: this.role,
      isEmailVerified: this.isEmailVerified,
      isTwoFactorEnabled: this.isTwoFactorEnabled,
      lastLoginAt: this.lastLoginAt ? this.lastLoginAt.toISOString() : null,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      registrationIp: this.registrationIp,
      loginIps: this.loginIps,
    };
  }
}
