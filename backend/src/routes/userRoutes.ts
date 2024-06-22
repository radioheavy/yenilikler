import { Router, Request, Response, NextFunction } from "express";
import { UserController } from "../controllers/UserController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();
const userController = new UserController();

router.post("/", (req: Request, res: Response, next: NextFunction) => userController.createUser(req, res, next));
router.get("/:email", authenticateToken, (req: Request, res: Response, next: NextFunction) => userController.getUserByEmail(req, res, next));
router.put("/:id", authenticateToken, (req: Request, res: Response, next: NextFunction) => userController.updateUser(req, res, next));
router.delete("/:id", authenticateToken, (req: Request, res: Response, next: NextFunction) => userController.deleteUser(req, res, next));
router.post("/:id/verify-email", authenticateToken, (req: Request, res: Response, next: NextFunction) => userController.verifyEmail(req, res, next));

// Yeni eklenen profil güncelleme rotası
router.put("/profile", authenticateToken, (req: Request, res: Response, next: NextFunction) => userController.updateProfile(req, res, next));

export default router;