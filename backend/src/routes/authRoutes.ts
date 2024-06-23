import { Router, Request, Response, NextFunction } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middlewares/authMiddleware';
import passport from 'passport';

const router = Router();
const authController = new AuthController();

router.post('/login', authController.login.bind(authController));
router.post('/refresh-token', authController.refreshToken.bind(authController));
router.post('/forgot-password', authController.forgotPassword.bind(authController));
router.post('/reset-password', authController.resetPassword.bind(authController));
router.post('/generate-2fa', authenticateToken, authController.generateTwoFactorSecret.bind(authController));
router.post('/verify-2fa', authController.verifyTwoFactorToken.bind(authController));
router.post('/disable-2fa', authenticateToken, authController.disableTwoFactor.bind(authController));
router.post('/login-2fa', authController.loginWithTwoFactor.bind(authController));

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/oauth/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/' }), authController.oauthCallback.bind(authController));

// Facebook OAuth routes
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/oauth/facebook/callback', passport.authenticate('facebook', { session: false, failureRedirect: '/' }), authController.oauthCallback.bind(authController));

export default router;
