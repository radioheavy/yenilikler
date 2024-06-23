"use strict";
// src/controllers/UserController.ts
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
exports.UserController = void 0;
const UserService_1 = require("../services/UserService");
const errors_1 = require("../utils/errors");
class UserController {
    constructor(webSocketServer) {
        this.userService = new UserService_1.UserService(webSocketServer);
    }
    createUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userService.createUser(req.body);
                res.status(201).json(user);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getUserByEmail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userService.findUserByEmail(req.params.email);
                res.json(user);
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = yield this.userService.updateUser(req.params.id, req.body);
                res.json(user);
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.userService.deleteUser(req.params.id);
                res.status(204).send();
            }
            catch (error) {
                next(error);
            }
        });
    }
    verifyEmail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { token } = req.params;
                const user = yield this.userService.verifyEmail(token);
                res.json({ message: "Email verified successfully", user });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateProfile(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const updatedUser = yield this.userService.updateUser(userId, req.body);
                res.json(updatedUser);
            }
            catch (error) {
                next(error);
            }
        });
    }
    changePassword(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                const { currentPassword, newPassword } = req.body;
                yield this.userService.changePassword(userId, currentPassword, newPassword);
                res.status(200).json({ message: "Password changed successfully" });
            }
            catch (error) {
                next(error);
            }
        });
    }
    resendVerificationEmail(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.user.id;
                yield this.userService.resendVerificationEmail(userId);
                res.json({ message: "Verification email resent successfully" });
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
                const userId = req.user.id;
                const { token } = req.body;
                const isValid = yield this.userService.verifyTwoFactorToken(userId, token);
                if (isValid) {
                    res.json({ message: "Two-factor authentication enabled successfully" });
                }
                else {
                    throw new errors_1.BadRequestError("Invalid two-factor token");
                }
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
}
exports.UserController = UserController;
