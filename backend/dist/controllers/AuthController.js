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
exports.AuthController = void 0;
const AuthService_1 = require("../services/AuthService");
const UserService_1 = require("../services/UserService");
const passport_1 = __importDefault(require("passport"));
class AuthController {
    constructor(webSocketServer) {
        this.webSocketServer = webSocketServer;
        this.authService = new AuthService_1.AuthService(webSocketServer);
        this.userService = new UserService_1.UserService(webSocketServer);
    }
    login(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password } = req.body;
                const result = yield this.authService.login(email, password);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    refreshToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { refreshToken } = req.body;
                const result = yield this.authService.refreshToken(refreshToken);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    forgotPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                yield this.userService.createResetPasswordToken(email);
                res.json({ message: "If a user with that email exists, a password reset email has been sent." });
            }
            catch (error) {
                next(error);
            }
        });
    }
    resetPassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token, newPassword } = req.body;
                const user = yield this.userService.resetPassword(token, newPassword);
                res.json({ message: "Password has been reset successfully." });
            }
            catch (error) {
                next(error);
            }
        });
    }
    generateTwoFactorSecret(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const result = yield this.userService.generateTwoFactorSecret(userId);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    verifyTwoFactorToken(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, token } = req.body;
                const result = yield this.authService.verifyTwoFactorToken(userId, token);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    disableTwoFactor(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                yield this.userService.disableTwoFactor(userId);
                res.json({ message: "Two-factor authentication disabled successfully" });
            }
            catch (error) {
                next(error);
            }
        });
    }
    loginWithTwoFactor(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, password, twoFactorToken } = req.body;
                const result = yield this.authService.loginWithTwoFactor(email, password, twoFactorToken);
                res.json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    googleAuth(req, res, next) {
        passport_1.default.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
    }
    facebookAuth(req, res, next) {
        passport_1.default.authenticate('facebook', { scope: ['email'] })(req, res, next);
    }
    oauthCallback(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const provider = req.query.provider;
                const result = yield this.authService.handleSocialLogin(user, provider);
                res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${result.token}&refreshToken=${result.refreshToken}`);
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.AuthController = AuthController;
