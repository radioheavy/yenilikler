"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = userRoutes;
const express_1 = require("express");
const UserController_1 = require("../controllers/UserController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
function userRoutes(webSocketServer) {
    const router = (0, express_1.Router)();
    const userController = new UserController_1.UserController(webSocketServer);
    router.post("/", (req, res, next) => userController.createUser(req, res, next));
    router.get("/:email", authMiddleware_1.authenticateToken, (req, res, next) => userController.getUserByEmail(req, res, next));
    router.put("/:id", authMiddleware_1.authenticateToken, (req, res, next) => userController.updateUser(req, res, next));
    router.delete("/:id", authMiddleware_1.authenticateToken, (req, res, next) => userController.deleteUser(req, res, next));
    router.get("/verify-email/:token", (req, res, next) => userController.verifyEmail(req, res, next));
    router.put("/profile", authMiddleware_1.authenticateToken, (req, res, next) => userController.updateProfile(req, res, next));
    router.post("/change-password", authMiddleware_1.authenticateToken, (req, res, next) => userController.changePassword(req, res, next));
    router.post("/resend-verification", authMiddleware_1.authenticateToken, (req, res, next) => userController.resendVerificationEmail(req, res, next));
    router.post("/generate-2fa", authMiddleware_1.authenticateToken, (req, res, next) => userController.generateTwoFactorSecret(req, res, next));
    router.post("/verify-2fa", authMiddleware_1.authenticateToken, (req, res, next) => userController.verifyTwoFactorToken(req, res, next));
    router.post("/disable-2fa", authMiddleware_1.authenticateToken, (req, res, next) => userController.disableTwoFactor(req, res, next));
    return router;
}
