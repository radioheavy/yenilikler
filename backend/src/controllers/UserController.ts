/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { BadRequestError, NotFoundError } from '../utils/errors';
import { WebSocketServer } from '../websocket/socketServer';

export class UserController {
  private userService: UserService;

  constructor(webSocketServer: WebSocketServer) {
    this.userService = new UserService(webSocketServer);
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async getUserByEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findUserByEmail(req.params.email);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.findUserById(req.params.id);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.userService.updateUser(req.params.id, req.body);
      res.json(user);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      await this.userService.deleteUser(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, token } = req.body;
      const user = await this.userService.verifyEmailCode(email, token);
      res.json({ message: 'Email verified successfully', user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const updatedUser = await this.userService.updateUser(userId, req.body);
      res.json(updatedUser);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { currentPassword, newPassword } = req.body;
      await this.userService.changePassword(userId, currentPassword, newPassword);
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }

  async resendVerificationEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      await this.userService.resendVerificationEmail(email);
      res.json({ message: 'Verification email resent successfully' });
    } catch (error) {
      next(error);
    }
  }

  async generateTwoFactorSecret(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const result = await this.userService.generateTwoFactorSecret(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async verifyTwoFactorToken(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const { token } = req.body;
      const isValid = await this.userService.verifyTwoFactorToken(userId, token);
      if (isValid) {
        res.json({ message: 'Two-factor authentication enabled successfully' });
      } else {
        throw new BadRequestError('Invalid two-factor token');
      }
    } catch (error) {
      next(error);
    }
  }

  async disableTwoFactor(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      await this.userService.disableTwoFactor(userId);
      res.json({ message: 'Two-factor authentication disabled successfully' });
    } catch (error) {
      next(error);
    }
  }

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await this.userService.getAllUsers();
      res.json(users);
    } catch (error) {
      next(error);
    }
  }
}
