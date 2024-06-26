import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserController } from '../controllers/UserController';
import { authenticateToken } from '../middlewares/authMiddleware';
import passport from 'passport';
import { WebSocketServer } from '../websocket/socketServer';

export default function authRoutes(webSocketServer: WebSocketServer) {
    const router = Router();
    const authController = new AuthController(webSocketServer);
    const userController = new UserController(webSocketServer);

    router.post('/login', authController.login.bind(authController));
    router.post('/refresh-token', authController.refreshToken.bind(authController));
    router.post('/forgot-password', authController.forgotPassword.bind(authController));
    router.post('/reset-password', authController.resetPassword.bind(authController));
    router.post('/generate-2fa', authenticateToken, authController.generateTwoFactorSecret.bind(authController));
    router.post('/verify-2fa', authController.verifyTwoFactorToken.bind(authController));
    router.post('/disable-2fa', authenticateToken, authController.disableTwoFactor.bind(authController));
    router.post('/login-2fa', authController.loginWithTwoFactor.bind(authController));
    router.post('/register', authController.register.bind(authController));

    // Google OAuth routes
    router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
    router.get('/oauth/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }), authController.oauthCallback.bind(authController));

    // Facebook OAuth routes
    router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
    router.get('/oauth/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: '/' }), authController.oauthCallback.bind(authController));

    // E-posta doğrulama ve doğrulama e-postası yeniden gönderme rotaları
    router.post("/verify-email", authController.verifyEmail.bind(authController));
    router.post("/resend-verification", userController.resendVerificationEmail.bind(userController));

    // Yeni eklenen kullanıcı bilgilerini getiren rota
    router.get('/user', authenticateToken, authController.getCurrentUser.bind(authController));

    // Yeni eklenen check-auth rotası
    router.get('/check-auth', authenticateToken, authController.checkAuth.bind(authController));

    return router;
}
