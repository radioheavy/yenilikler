"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = authRoutes;
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const passport_1 = __importDefault(require("passport"));
function authRoutes(webSocketServer) {
    const router = (0, express_1.Router)();
    const authController = new AuthController_1.AuthController(webSocketServer);
    router.post('/login', authController.login.bind(authController));
    router.post('/refresh-token', authController.refreshToken.bind(authController));
    router.post('/forgot-password', authController.forgotPassword.bind(authController));
    router.post('/reset-password', authController.resetPassword.bind(authController));
    router.post('/generate-2fa', authMiddleware_1.authenticateToken, authController.generateTwoFactorSecret.bind(authController));
    router.post('/verify-2fa', authController.verifyTwoFactorToken.bind(authController));
    router.post('/disable-2fa', authMiddleware_1.authenticateToken, authController.disableTwoFactor.bind(authController));
    router.post('/login-2fa', authController.loginWithTwoFactor.bind(authController));
    // Google OAuth routes
    router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
    router.get('/oauth/google/callback', passport_1.default.authenticate('google', { session: false, failureRedirect: '/' }), authController.oauthCallback.bind(authController));
    // Facebook OAuth routes
    router.get('/facebook', passport_1.default.authenticate('facebook', { scope: ['email'] }));
    router.get('/oauth/facebook/callback', passport_1.default.authenticate('facebook', { session: false, failureRedirect: '/' }), authController.oauthCallback.bind(authController));
    return router;
}
