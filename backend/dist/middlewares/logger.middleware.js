"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggerMiddleware = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const loggerMiddleware = (req, res, next) => {
    logger_1.default.http(`${req.method} ${req.path}`);
    next();
};
exports.loggerMiddleware = loggerMiddleware;
