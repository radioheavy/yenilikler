import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { validate } from "class-validator";
import { BadRequestError, NotFoundError, UnauthorizedError } from "../utils/errors";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from 'uuid';
import { EmailService } from "./EmailService";
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { WebSocketServer } from '../websocket/socketServer';

export class UserService {
  private userRepository = AppDataSource.getRepository(User);
  private emailService: EmailService;
  private webSocketServer: WebSocketServer;

  constructor(webSocketServer: WebSocketServer) {
    this.emailService = new EmailService();
    this.webSocketServer = webSocketServer;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const existingUser = await this.userRepository.findOne({ where: { email: userData.email } });
    if (existingUser) {
        throw new BadRequestError("A user with this email already exists.");
    }

    const user = this.userRepository.create(userData);

    if (user.password) {
        console.log(`Original password: ${user.password}`); // Log the original password
        user.password = await bcrypt.hash(user.password, 10);
        console.log(`Hashed password: ${user.password}`); // Log the hashed password
    }

    const errors = await validate(user);
    if (errors.length > 0) {
        throw new BadRequestError(`Validation failed: ${errors.toString()}`);
    }

    user.emailVerificationToken = this.generateToken();
    user.emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat geçerli

    await this.userRepository.save(user);

    await this.emailService.sendVerificationEmail(user.email, user.emailVerificationToken);

    this.webSocketServer.broadcastToAll('new_user_registered', { userId: user.id });

    return user;
}


  async findUserByEmail(email: string): Promise<User> {
    console.log(`Finding user by email: ${email}`); // Log added here
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
    if (userData.password) {
        userData.password = await bcrypt.hash(userData.password, 10);
    }
    Object.assign(user, userData);
    const errors = await validate(user);
    if (errors.length > 0) {
        throw new BadRequestError(`Validation failed: ${errors.toString()}`);
    }
    const updatedUser = await this.userRepository.save(user);
    this.webSocketServer.sendToUser(id, 'user_updated', { userId: id });
    return updatedUser;
}

  async deleteUser(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundError("User not found");
    }
    this.webSocketServer.broadcastToAll('user_deleted', { userId: id });
  }

  async verifyEmailCode(email: string, token: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { email, emailVerificationToken: token } });
    if (!user) {
      throw new NotFoundError("Invalid verification token");
    }
    
    if (user.emailVerificationTokenExpires && user.emailVerificationTokenExpires < new Date()) {
      throw new BadRequestError("Verification token has expired");
    }
    
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpires = undefined;
    
    const verifiedUser = await this.userRepository.save(user);
    this.webSocketServer.sendToUser(verifiedUser.id, 'email_verified', { userId: verifiedUser.id });
    return verifiedUser;
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
    user.password = await bcrypt.hash(newPassword, 10);
    const errors = await validate(user);
    if (errors.length > 0) {
      throw new BadRequestError(`Validation failed: ${errors.toString()}`);
    }
    await this.userRepository.save(user);
    this.webSocketServer.sendToUser(userId, 'password_changed', { userId });
  }

  async resendVerificationEmail(email: string): Promise<void> {
    const user = await this.findUserByEmail(email);
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

  async resetPassword(token: string, newPassword: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { resetPasswordToken: token } });
    if (!user || !user.resetPasswordTokenExpires || user.resetPasswordTokenExpires < new Date()) {
      throw new BadRequestError("Invalid or expired password reset token");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpires = undefined;

    const errors = await validate(user);
    if (errors.length > 0) {
      throw new BadRequestError(`Validation failed: ${errors.toString()}`);
    }

    const updatedUser = await this.userRepository.save(user);
    this.webSocketServer.sendToUser(user.id, 'password_reset', { userId: user.id });
    return updatedUser;
  }

  async generateTwoFactorSecret(userId: string): Promise<{ secret: string, otpauthUrl: string, qrCodeUrl: string }> {
    const user = await this.findUserById(userId);
    
    const secret = speakeasy.generateSecret({ name: `YourAppName:${user.email}` });
    user.twoFactorSecret = secret.base32;
    await this.userRepository.save(user);

    const otpauthUrl = secret.otpauth_url || `otpauth://totp/YourAppName:${user.email}?secret=${secret.base32}&issuer=YourAppName`;
    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

    this.webSocketServer.sendToUser(userId, 'two_factor_secret_generated', { userId });
    return { secret: secret.base32, otpauthUrl, qrCodeUrl };
  }

  async verifyTwoFactorToken(userId: string, token: string): Promise<boolean> {
    const user = await this.findUserById(userId);
    
    if (!user.twoFactorSecret) {
      throw new BadRequestError("Two-factor authentication is not set up for this user");
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: token
    });

    if (verified) {
      user.isTwoFactorEnabled = true;
      await this.userRepository.save(user);
      this.webSocketServer.sendToUser(userId, 'two_factor_enabled', { userId });
    }

    return verified;
  }

  async disableTwoFactor(userId: string): Promise<void> {
    const user = await this.findUserById(userId);
    user.twoFactorSecret = undefined;
    user.isTwoFactorEnabled = false;
    await this.userRepository.save(user);
    this.webSocketServer.sendToUser(userId, 'two_factor_disabled', { userId });
  }

  private generateToken(): string {
    return uuidv4().slice(0, 6); // 6 haneli doğrulama kodu
  }
}
