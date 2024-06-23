"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const data_source_1 = require("../data-source");
const User_1 = require("../entities/User");
const class_validator_1 = require("class-validator");
const errors_1 = require("../utils/errors");
const bcrypt = __importStar(require("bcrypt"));
const uuid_1 = require("uuid");
const EmailService_1 = require("./EmailService");
const speakeasy = __importStar(require("speakeasy"));
const qrcode = __importStar(require("qrcode"));
class UserService {
    constructor(webSocketServer) {
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.emailService = new EmailService_1.EmailService();
        this.webSocketServer = webSocketServer;
    }
    createUser(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = this.userRepository.create(userData);
            const errors = yield (0, class_validator_1.validate)(user);
            if (errors.length > 0) {
                throw new errors_1.BadRequestError(`Validation failed: ${errors.toString()}`);
            }
            user.emailVerificationToken = this.generateToken();
            user.emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat geçerli
            yield this.userRepository.save(user);
            yield this.emailService.sendVerificationEmail(user.email, user.emailVerificationToken);
            this.webSocketServer.broadcastToAll('new_user_registered', { userId: user.id });
            return user;
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findOne({ where: { email } });
            if (!user) {
                throw new errors_1.NotFoundError("User not found");
            }
            return user;
        });
    }
    findUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findOne({ where: { id } });
            if (!user) {
                throw new errors_1.NotFoundError("User not found");
            }
            return user;
        });
    }
    updateUser(id, userData) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.findUserById(id);
            Object.assign(user, userData);
            const errors = yield (0, class_validator_1.validate)(user);
            if (errors.length > 0) {
                throw new errors_1.BadRequestError(`Validation failed: ${errors.toString()}`);
            }
            const updatedUser = yield this.userRepository.save(user);
            this.webSocketServer.sendToUser(id, 'user_updated', { userId: id });
            return updatedUser;
        });
    }
    deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.userRepository.delete(id);
            if (result.affected === 0) {
                throw new errors_1.NotFoundError("User not found");
            }
            this.webSocketServer.broadcastToAll('user_deleted', { userId: id });
        });
    }
    verifyEmail(token) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findOne({ where: { emailVerificationToken: token } });
            if (!user) {
                throw new errors_1.NotFoundError("Invalid verification token");
            }
            if (user.emailVerificationTokenExpires && user.emailVerificationTokenExpires < new Date()) {
                throw new errors_1.BadRequestError("Verification token has expired");
            }
            user.isEmailVerified = true;
            user.emailVerificationToken = undefined;
            user.emailVerificationTokenExpires = undefined;
            const verifiedUser = yield this.userRepository.save(user);
            this.webSocketServer.sendToUser(verifiedUser.id, 'email_verified', { userId: verifiedUser.id });
            return verifiedUser;
        });
    }
    updateLastLogin(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.findUserById(id);
            user.lastLoginAt = new Date();
            return this.userRepository.save(user);
        });
    }
    changePassword(userId, currentPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.findUserById(userId);
            const isPasswordValid = yield user.validatePassword(currentPassword);
            if (!isPasswordValid) {
                throw new errors_1.UnauthorizedError("Current password is incorrect");
            }
            user.password = yield bcrypt.hash(newPassword, 10);
            const errors = yield (0, class_validator_1.validate)(user);
            if (errors.length > 0) {
                throw new errors_1.BadRequestError(`Validation failed: ${errors.toString()}`);
            }
            yield this.userRepository.save(user);
            this.webSocketServer.sendToUser(userId, 'password_changed', { userId });
        });
    }
    resendVerificationEmail(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.findUserById(userId);
            if (user.isEmailVerified) {
                throw new errors_1.BadRequestError("Email is already verified");
            }
            user.emailVerificationToken = this.generateToken();
            user.emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 saat geçerli
            yield this.userRepository.save(user);
            yield this.emailService.sendVerificationEmail(user.email, user.emailVerificationToken);
        });
    }
    createResetPasswordToken(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.findUserByEmail(email);
            user.resetPasswordToken = this.generateToken();
            user.resetPasswordTokenExpires = new Date(Date.now() + 3600000); // 1 saat geçerli
            yield this.userRepository.save(user);
            yield this.emailService.sendResetPasswordEmail(user.email, user.resetPasswordToken);
        });
    }
    resetPassword(token, newPassword) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findOne({ where: { resetPasswordToken: token } });
            if (!user || !user.resetPasswordTokenExpires || user.resetPasswordTokenExpires < new Date()) {
                throw new errors_1.BadRequestError("Invalid or expired password reset token");
            }
            user.password = yield bcrypt.hash(newPassword, 10);
            user.resetPasswordToken = undefined;
            user.resetPasswordTokenExpires = undefined;
            const errors = yield (0, class_validator_1.validate)(user);
            if (errors.length > 0) {
                throw new errors_1.BadRequestError(`Validation failed: ${errors.toString()}`);
            }
            const updatedUser = yield this.userRepository.save(user);
            this.webSocketServer.sendToUser(user.id, 'password_reset', { userId: user.id });
            return updatedUser;
        });
    }
    generateTwoFactorSecret(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.findUserById(userId);
            const secret = speakeasy.generateSecret({ name: `YourAppName:${user.email}` });
            user.twoFactorSecret = secret.base32;
            yield this.userRepository.save(user);
            const otpauthUrl = secret.otpauth_url || `otpauth://totp/YourAppName:${user.email}?secret=${secret.base32}&issuer=YourAppName`;
            const qrCodeUrl = yield qrcode.toDataURL(otpauthUrl);
            this.webSocketServer.sendToUser(userId, 'two_factor_secret_generated', { userId });
            return { secret: secret.base32, otpauthUrl, qrCodeUrl };
        });
    }
    verifyTwoFactorToken(userId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.findUserById(userId);
            if (!user.twoFactorSecret) {
                throw new errors_1.BadRequestError("Two-factor authentication is not set up for this user");
            }
            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret,
                encoding: 'base32',
                token: token
            });
            if (verified) {
                user.isTwoFactorEnabled = true;
                yield this.userRepository.save(user);
                this.webSocketServer.sendToUser(userId, 'two_factor_enabled', { userId });
            }
            return verified;
        });
    }
    disableTwoFactor(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.findUserById(userId);
            user.twoFactorSecret = undefined;
            user.isTwoFactorEnabled = false;
            yield this.userRepository.save(user);
            this.webSocketServer.sendToUser(userId, 'two_factor_disabled', { userId });
        });
    }
    generateToken() {
        return (0, uuid_1.v4)();
    }
}
exports.UserService = UserService;
