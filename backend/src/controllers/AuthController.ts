import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import passport from 'passport';
import { User } from '../entities/User';
import { WebSocketServer } from '../websocket/socketServer';

export class AuthController {
    private authService: AuthService;
    private userService: UserService;
    private webSocketServer: WebSocketServer;

    constructor(webSocketServer: WebSocketServer) {
        this.webSocketServer = webSocketServer;
        this.authService = new AuthService(webSocketServer);
        this.userService = new UserService(webSocketServer);
    }

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const ip = req.ip || req.socket.remoteAddress || 'Unknown';
            const user = await this.userService.createUser({...req.body, registrationIp: ip});
            res.status(201).json({
                message: "User registered successfully",
                user: user.toJSON()
            });
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const ip = req.ip || req.socket.remoteAddress || 'Unknown';
            console.log(`Login request received for email: ${email}`);
            const result = await this.authService.login(email, password, ip);
            console.log('Login result:', result);
            res.json(result);
        } catch (error) {
            console.error('Login error in controller:', error);
            next(error);
        }
    }

    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const { refreshToken } = req.body;
            const result = await this.authService.refreshToken(refreshToken);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            await this.userService.createResetPasswordToken(email);
            res.json({ message: "If a user with that email exists, a password reset email has been sent." });
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, newPassword } = req.body;
            const user = await this.userService.resetPassword(token, newPassword);
            res.json({ message: "Password has been reset successfully." });
        } catch (error) {
            next(error);
        }
    }

    async generateTwoFactorSecret(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId; // req.user'ın kesinlikle tanımlı olduğunu belirtmek için '!' operatörü kullanıldı.
            const result = await this.userService.generateTwoFactorSecret(userId);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async verifyTwoFactorToken(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId, token } = req.body;
            const ip = req.ip || req.socket.remoteAddress || 'Unknown';
            const result = await this.authService.verifyTwoFactorToken(userId, token, ip);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async disableTwoFactor(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            await this.userService.disableTwoFactor(userId);
            res.json({ message: "Two-factor authentication disabled successfully" });
        } catch (error) {
            next(error);
        }
    }

    async loginWithTwoFactor(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password, twoFactorToken } = req.body;
            const ip = req.ip || req.socket.remoteAddress || 'Unknown';
            const result = await this.authService.loginWithTwoFactor(email, password, twoFactorToken, ip);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async verifyEmail(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, token } = req.body;
            const user = await this.userService.verifyEmailCode(email, token);
            res.json({ message: "Email verified successfully", user });
        } catch (error) {
            next(error);
        }
    }

    googleAuth(req: Request, res: Response, next: NextFunction) {
        passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
    }

    facebookAuth(req: Request, res: Response, next: NextFunction) {
        passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
    }

    async oauthCallback(req: Request, res: Response, next: NextFunction) {
        try {
            const user = req.user as unknown as User;
            const provider = req.query.provider as 'google' | 'facebook';
            const ip = req.ip || req.socket.remoteAddress || 'Unknown';
            const result = await this.authService.handleSocialLogin(user, provider, ip);
            res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${result.token}&refreshToken=${result.refreshToken}`);
        } catch (error) {
            next(error);
        }
    }

    async getCurrentUser(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const user = await this.userService.findUserById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json(user);
        } catch (error) {
            next(error);
        }
    }

    async checkAuth(req: Request, res: Response, next: NextFunction) {
        try {
            res.json({ isAuthenticated: true });
        } catch (error) {
            next(error);
        }
    }

    async getLoginHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const loginHistory = await this.userService.getLoginHistory(userId);
            res.json(loginHistory);
        } catch (error) {
            next(error);
        }
    }

    async getRegistrationIp(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const user = await this.userService.findUserById(userId);
            res.json({ registrationIp: user.registrationIp });
        } catch (error) {
            next(error);
        }
    }

    async getLastLoginIp(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user!.userId;
            const loginHistory = await this.userService.getLoginHistory(userId);
            const lastLoginIp = loginHistory.length > 0 ? loginHistory[loginHistory.length - 1].ip : null;
            res.json({ lastLoginIp });
        } catch (error) {
            next(error);
        }
    }
}
