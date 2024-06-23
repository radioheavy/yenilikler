import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { validate } from "class-validator";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../utils/errors";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from "./EmailService";

export class UserService {
  private userRepository = AppDataSource.getRepository(User);
  private emailService: EmailService;

  constructor() {
    this.emailService = new EmailService();
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    const errors = await validate(user);
    if (errors.length > 0) {
      throw new BadRequestError(`Validation failed: ${errors.toString()}`);
    }
    
    user.emailVerificationToken = this.generateToken();
    user.emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat geçerli

    await this.userRepository.save(user);
    
    await this.emailService.sendVerificationEmail(user.email, user.emailVerificationToken);
    
    return user;
  }

  async findUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const user = await this.findUserById(id);
    Object.assign(user, userData);
    const errors = await validate(user);
    if (errors.length > 0) {
      throw new BadRequestError(`Validation failed: ${errors.toString()}`);
    }
    return this.userRepository.save(user);
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundError("User not found");
    }
  }

  async verifyEmail(token: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { emailVerificationToken: token } });
    if (!user) {
      throw new NotFoundError("Invalid verification token");
    }
    
    if (user.emailVerificationTokenExpires && user.emailVerificationTokenExpires < new Date()) {
      throw new BadRequestError("Verification token has expired");
    }
    
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    
    return this.userRepository.save(user);
  }

  async updateLastLogin(id: string): Promise<User> {
    const user = await this.findUserById(id);
    user.lastLoginAt = new Date();
    return this.userRepository.save(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findUserById(userId);
    const isPasswordValid = await user.validatePassword(currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedError("Current password is incorrect");
    }
    user.password = newPassword;
    const errors = await validate(user);
    if (errors.length > 0) {
      throw new BadRequestError(`Validation failed: ${errors.toString()}`);
    }
    await this.userRepository.save(user);
  }

  async resendVerificationEmail(userId: string): Promise<void> {
    const user = await this.findUserById(userId);
    if (user.isEmailVerified) {
      throw new BadRequestError("Email is already verified");
    }
    
    user.emailVerificationToken = this.generateToken();
    user.emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat geçerli

    await this.userRepository.save(user);
    
    await this.emailService.sendVerificationEmail(user.email, user.emailVerificationToken);
  }

  async createResetPasswordToken(email: string): Promise<void> {
    const user = await this.findUserByEmail(email);
    user.resetPasswordToken = this.generateToken();
    user.resetPasswordTokenExpires = new Date(Date.now() + 3600000); // 1 saat geçerli

    await this.userRepository.save(user);
    
    await this.emailService.sendResetPasswordEmail(user.email, user.resetPasswordToken);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { resetPasswordToken: token } });
    if (!user || !user.resetPasswordTokenExpires || user.resetPasswordTokenExpires < new Date()) {
      throw new BadRequestError("Invalid or expired password reset token");
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;

    const errors = await validate(user);
    if (errors.length > 0) {
      throw new BadRequestError(`Validation failed: ${errors.toString()}`);
    }

    await this.userRepository.save(user);
  }

  private generateToken(): string {
    return uuidv4();
  }
}