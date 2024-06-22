import { User } from '../entities/User';
import { UserService } from './UserService';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { BadRequestError } from '../utils/errors';

export class AuthService {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    async validateUser(email: string, password: string): Promise<User | null> {
        const user = await this.userService.findUserByEmail(email);
        if (user && await bcrypt.compare(password, user.password)) {
            return user;
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

    async login(email: string, password: string): Promise<{ user: User, token: string, refreshToken: string }> {
        const user = await this.validateUser(email, password);
        if (!user) {
            throw new BadRequestError('Invalid email or password');
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
}