import { Router, Request, Response, NextFunction } from "express";
import { UserController } from "../controllers/UserController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - firstName
 *         - lastName
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         email:
 *           type: string
 *           description: The user's email
 *         firstName:
 *           type: string
 *           description: The user's first name
 *         lastName:
 *           type: string
 *           description: The user's last name
 *         isEmailVerified:
 *           type: boolean
 *           description: Whether the user's email is verified
 *         role:
 *           type: string
 *           description: The user's role
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Bad request
 */
router.post("/", (req: Request, res: Response, next: NextFunction) =>
  userController.createUser(req, res, next)
);

/**
 * @swagger
 * /api/users/{email}:
 *   get:
 *     summary: Get a user by email
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's email
 *     responses:
 *       200:
 *         description: The user description by email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: The user was not found
 */
router.get("/:email", authenticateToken, (req: Request, res: Response, next: NextFunction) =>
  userController.getUserByEmail(req, res, next)
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The updated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: The user was not found
 *       400:
 *         description: Some parameters may contain invalid values
 */
router.put("/:id", authenticateToken, (req: Request, res: Response, next: NextFunction) =>
  userController.updateUser(req, res, next)
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The user id
 *     responses:
 *       204:
 *         description: The user was deleted
 *       404:
 *         description: The user was not found
 */
router.delete("/:id", authenticateToken, (req: Request, res: Response, next: NextFunction) =>
  userController.deleteUser(req, res, next)
);

/**
 * @swagger
 * /api/users/verify-email/{token}:
 *   get:
 *     summary: Verify user's email
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: The verification token
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid token
 */
router.get("/verify-email/:token", (req: Request, res: Response, next: NextFunction) =>
  userController.verifyEmail(req, res, next)
);

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: The updated profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Some parameters may contain invalid values
 */
router.put("/profile", authenticateToken, (req: Request, res: Response, next: NextFunction) =>
  userController.updateProfile(req, res, next)
);

/**
 * @swagger
 * /api/users/change-password:
 *   post:
 *     summary: Change user's password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password
 */
router.post("/change-password", authenticateToken, (req: Request, res: Response, next: NextFunction) =>
  userController.changePassword(req, res, next)
);

/**
 * @swagger
 * /api/users/resend-verification:
 *   post:
 *     summary: Resend verification email
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Verification email sent successfully
 *       400:
 *         description: User's email is already verified
 */
router.post("/resend-verification", authenticateToken, (req: Request, res: Response, next: NextFunction) =>
  userController.resendVerificationEmail(req, res, next)
);

export default router;