import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { WebSocketServer } from '../websocket/socketServer';

export default function userRoutes(webSocketServer: WebSocketServer) {
  const router = Router();
  const userController = new UserController(webSocketServer);

  router.post('/', (req, res, next) => userController.createUser(req, res, next));

  router.get('/:email', authenticateToken, (req, res, next) =>
    userController.getUserByEmail(req, res, next),
  );

  router.get('/:id', authenticateToken, (req, res, next) =>
    userController.getUserById(req, res, next),
  );

  router.put('/:id', authenticateToken, (req, res, next) =>
    userController.updateUser(req, res, next),
  );

  router.delete('/:id', authenticateToken, (req, res, next) =>
    userController.deleteUser(req, res, next),
  );

  router.get('/verify-email/:token', (req, res, next) =>
    userController.verifyEmail(req, res, next),
  );

  router.put('/profile', authenticateToken, (req, res, next) =>
    userController.updateProfile(req, res, next),
  );

  router.post('/change-password', authenticateToken, (req, res, next) =>
    userController.changePassword(req, res, next),
  );

  router.post('/resend-verification', authenticateToken, (req, res, next) =>
    userController.resendVerificationEmail(req, res, next),
  );

  router.post('/generate-2fa', authenticateToken, (req, res, next) =>
    userController.generateTwoFactorSecret(req, res, next),
  );

  router.post('/verify-2fa', authenticateToken, (req, res, next) =>
    userController.verifyTwoFactorToken(req, res, next),
  );

  router.post('/disable-2fa', authenticateToken, (req, res, next) =>
    userController.disableTwoFactor(req, res, next),
  );

  router.get('/', authenticateToken, (req, res, next) =>
    userController.getAllUsers(req, res, next),
  );
  return router;
}
