"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.decodeToken = decodeToken;
// src/utils/jwt.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("./errors");
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
function generateToken(user) {
    const payload = {
        userId: user.id,
        email: user.email
    };
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}
function verifyToken(token) {
    return new Promise((resolve, reject) => {
        jsonwebtoken_1.default.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                reject(new errors_1.UnauthorizedError('Invalid token'));
            }
            else {
                resolve(decoded);
            }
        });
    });
}
function decodeToken(token) {
    try {
        return jsonwebtoken_1.default.decode(token);
    }
    catch (error) {
        return null;
    }
}
