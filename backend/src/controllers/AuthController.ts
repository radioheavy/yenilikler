import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { UserService } from '../services/UserService';
import passport from 'passport';
import { User } from '../entities/User';

export class AuthController {
    private authService: AuthService;
    private userService: UserService;

    constructor() {
        this.authService = new AuthService();
        this.userService = new UserService();
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const result = await this.authService.login(email, password);
            res.json(result);
        } catch (error) {
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
            await this.userService.resetPassword(token, newPassword);
            res.json({ message: "Password has been reset successfully." });
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
            const { userId, token } = req.body;
            const result = await this.authService.verifyTwoFactorToken(userId, token);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async disableTwoFactor(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = (req as any).user.id;
            await this.userService.disableTwoFactor(userId);
            res.json({ message: "Two-factor authentication disabled successfully" });
        } catch (error) {
            next(error);
        }
    }

    async loginWithTwoFactor(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password, twoFactorToken } = req.body;
            const result = await this.authService.loginWithTwoFactor(email, password, twoFactorToken);
            res.json(result);
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
            const user = req.user as User;
            const provider = req.query.provider as 'google' | 'facebook'; // Provider bilgisini query parametrelerinden alın
            const result = await this.authService.handleSocialLogin(user, provider);
            res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${result.token}&refreshToken=${result.refreshToken}`);
        } catch (error) {
            next(error);
        }
    }
}
