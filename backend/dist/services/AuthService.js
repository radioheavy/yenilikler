"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const UserService_1 = require("./UserService");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const errors_1 = require("../utils/errors");
class AuthService {
    constructor(webSocketServer) {
        this.userService = new UserService_1.UserService(webSocketServer);
    }
    validateUser(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userService.findUserByEmail(email);
            if (user && (yield bcrypt_1.default.compare(password, user.password))) {
                return user;
            }
            return null;
        });
    }
    generateToken(user) {
        return jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });
    }
    generateRefreshToken(user) {
        return jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
    }
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.validateUser(email, password);
            if (!user) {
                throw new errors_1.BadRequestError('Invalid email or password');
            }
            if (user.isTwoFactorEnabled) {
                return { user, token: null, refreshToken: null, requiresTwoFactor: true };
            }
            user.lastLoginAt = new Date();
            yield this.userService.updateUser(user.id, { lastLoginAt: user.lastLoginAt });
            const token = this.generateToken(user);
            const refreshToken = this.generateRefreshToken(user);
            return { user, token, refreshToken, requiresTwoFactor: false };
        });
    }
    loginWithTwoFactor(email, password, twoFactorToken) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.validateUser(email, password);
            if (!user) {
                throw new errors_1.BadRequestError('Invalid email or password');
            }
            if (!user.isTwoFactorEnabled) {
                throw new errors_1.BadRequestError('Two-factor authentication is not enabled for this user');
            }
            const isValid = yield this.userService.verifyTwoFactorToken(user.id, twoFactorToken);
            if (!isValid) {
                throw new errors_1.UnauthorizedError('Invalid two-factor token');
            }
            user.lastLoginAt = new Date();
            yield this.userService.updateUser(user.id, { lastLoginAt: user.lastLoginAt });
            const token = this.generateToken(user);
            const refreshToken = this.generateRefreshToken(user);
            return { user, token, refreshToken };
        });
    }
    refreshToken(refreshToken) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const payload = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                const user = yield this.userService.findUserById(payload.userId);
                if (!user) {
                    throw new errors_1.BadRequestError('User not found');
                }
                const newToken = this.generateToken(user);
                const newRefreshToken = this.generateRefreshToken(user);
                return { user, token: newToken, refreshToken: newRefreshToken };
            }
            catch (error) {
                throw new errors_1.BadRequestError('Invalid refresh token');
            }
        });
    }
    verifyTwoFactorToken(userId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const isValid = yield this.userService.verifyTwoFactorToken(userId, token);
            if (!isValid) {
                throw new errors_1.UnauthorizedError("Invalid two-factor token");
            }
            const user = yield this.userService.findUserById(userId);
            user.lastLoginAt = new Date();
            yield this.userService.updateUser(user.id, { lastLoginAt: user.lastLoginAt });
            const jwtToken = this.generateToken(user);
            const refreshToken = this.generateRefreshToken(user);
            return { user, token: jwtToken, refreshToken };
        });
    }
    generateTwoFactorSecret(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.userService.generateTwoFactorSecret(userId);
        });
    }
    disableTwoFactor(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.userService.disableTwoFactor(userId);
        });
    }
    handleSocialLogin(profile, provider) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield this.userService.findUserByEmail(profile.emails[0].value);
            if (!user) {
                user = yield this.userService.createUser({
                    email: profile.emails[0].value,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    isEmailVerified: true,
                    password: Math.random().toString(36).slice(-8), // Generate a random password
                    [provider + 'Id']: profile.id
                });
            }
            else if (!user[provider + 'Id']) {
                yield this.userService.updateUser(user.id, { [provider + 'Id']: profile.id });
            }
            user.lastLoginAt = new Date();
            yield this.userService.updateUser(user.id, { lastLoginAt: user.lastLoginAt });
            const token = this.generateToken(user);
            const refreshToken = this.generateRefreshToken(user);
            return { user, token, refreshToken };
        });
    }
}
exports.AuthService = AuthService;
