import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from "typeorm";
import { IsEmail, MinLength, MaxLength } from "class-validator";
import * as bcrypt from "bcrypt";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
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

  @Column({ default: "user" })
  role!: string;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  emailVerificationToken?: string;

  @Column({ nullable: true })
  emailVerificationTokenExpires?: Date;

  @Column({ nullable: true })
  resetPasswordToken?: string;

  @Column({ nullable: true })
  resetPasswordTokenExpires?: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  toJSON() {
    const { password, emailVerificationToken, emailVerificationTokenExpires, resetPasswordToken, resetPasswordTokenExpires, ...userWithoutSensitiveInfo } = this;
    return userWithoutSensitiveInfo;
  }
}