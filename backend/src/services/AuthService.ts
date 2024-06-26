import { User } from '../entities/User';
import { UserService } from './UserService';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { BadRequestError, UnauthorizedError } from '../utils/errors';
import { WebSocketServer } from '../websocket/socketServer';

export class AuthService {
    private userService: UserService;

    constructor(webSocketServer: WebSocketServer) {
        this.userService = new UserService(webSocketServer);
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        console.log(`Validating user for email: ${email}`);
        const user = await this.userService.findUserByEmail(email);
        if (user) {
            console.log('User found');
            console.log('Input password:', password);
            console.log('Stored hashed password:', user.password);
            const isPasswordValid = await bcrypt.compare(password, user.password);
            console.log('Password valid:', isPasswordValid);
            if (isPasswordValid) {
                return user;
            }
        } else {
            console.log('User not found');
        }
        return null;
    }

    generateToken(user: User): string {
        return jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET as string, {
            expiresIn: '1h'
        });
    }

    generateRefreshToken(user: User): string {
        return jwt.sign(
            { userId: user.id },
            process.env.JWT_REFRESH_SECRET as string,
            { expiresIn: '7d' }
        );
    }

    async login(email: string, password: string): Promise<{ user: User, token: string | null, refreshToken: string | null, requiresTwoFactor: boolean }> {
        console.log(`Login attempt for email: ${email}`);
        try {
            const user = await this.validateUser(email, password);
            if (!user) {
                console.log('Invalid email or password');
                throw new BadRequestError('Invalid email or password');
            }
        
            if (user.isTwoFactorEnabled) {
                console.log('Two-factor authentication is enabled');
                return { user, token: null, refreshToken: null, requiresTwoFactor: true };
            }
        
            user.lastLoginAt = new Date();
            await this.userService.updateUser(user.id, { lastLoginAt: user.lastLoginAt });
            const token = this.generateToken(user);
            const refreshToken = this.generateRefreshToken(user);
            console.log('Login successful');
            return { user, token, refreshToken, requiresTwoFactor: false };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }
    

    async loginWithTwoFactor(email: string, password: string, twoFactorToken: string): Promise<{ user: User, token: string, refreshToken: string }> {
        const user = await this.validateUser(email, password);
        if (!user) {
            throw new BadRequestError('Invalid email or password');
        }

        if (!user.isTwoFactorEnabled) {
            throw new BadRequestError('Two-factor authentication is not enabled for this user');
        }

        const isValid = await this.userService.verifyTwoFactorToken(user.id, twoFactorToken);
        if (!isValid) {
            throw new UnauthorizedError('Invalid two-factor token');
        }

        user.lastLoginAt = new Date();
        await this.userService.updateUser(user.id, { lastLoginAt: user.lastLoginAt });
        const token = this.generateToken(user);
        const refreshToken = this.generateRefreshToken(user);
        return { user, token, refreshToken };
    }

    async refreshToken(refreshToken: string): Promise<{ user: User, token: string, refreshToken: string }> {
        try {
            const payload: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
            const user = await this.userService.findUserById(payload.userId);
            if (!user) {
                throw new BadRequestError('User not found');
            }
            const newToken = this.generateToken(user);
            const newRefreshToken = this.generateRefreshToken(user);
            return { user, token: newToken, refreshToken: newRefreshToken };
        } catch (error) {
            throw new BadRequestError('Invalid refresh token');
        }
    }

    async verifyTwoFactorToken(userId: string, token: string): Promise<{ user: User, token: string, refreshToken: string }> {
        const isValid = await this.userService.verifyTwoFactorToken(userId, token);
        
        if (!isValid) {
            throw new UnauthorizedError("Invalid two-factor token");
        }

        const user = await this.userService.findUserById(userId);
        user.lastLoginAt = new Date();
        await this.userService.updateUser(user.id, { lastLoginAt: user.lastLoginAt });

        const jwtToken = this.generateToken(user);
        const refreshToken = this.generateRefreshToken(user);

        return { user, token: jwtToken, refreshToken };
    }

    async generateTwoFactorSecret(userId: string): Promise<{ secret: string, otpauthUrl: string, qrCodeUrl: string }> {
        return this.userService.generateTwoFactorSecret(userId);
    }

    async disableTwoFactor(userId: string): Promise<void> {
        await this.userService.disableTwoFactor(userId);
    }

    async handleSocialLogin(profile: any, provider: 'google' | 'facebook'): Promise<{ user: User, token: string, refreshToken: string }> {
        let user = await this.userService.findUserByEmail(profile.emails[0].value);
        
        if (!user) {
            user = await this.userService.createUser({
                email: profile.emails[0].value,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                isEmailVerified: true,
                password: Math.random().toString(36).slice(-8), // Generate a random password
                [provider + 'Id']: profile.id
            });
        } else if (!user[provider + 'Id']) {
            await this.userService.updateUser(user.id, { [provider + 'Id']: profile.id });
        }

        user.lastLoginAt = new Date();
        await this.userService.updateUser(user.id, { lastLoginAt: user.lastLoginAt });

        const token = this.generateToken(user);
        const refreshToken = this.generateRefreshToken(user);

        return { user, token, refreshToken };
    }
}
