"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }
    sendVerificationEmail(to, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const verificationLink = `${process.env.APP_URL}/verify-email?token=${token}`;
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: to,
                subject: 'Verify Your Email',
                html: `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
            };
            try {
                yield this.transporter.sendMail(mailOptions);
            }
            catch (error) {
                console.error('Error sending verification email:', error);
                throw new Error('Failed to send verification email');
            }
        });
    }
    sendResetPasswordEmail(to, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const resetPasswordLink = `${process.env.APP_URL}/reset-password?token=${token}`;
            const mailOptions = {
                from: process.env.EMAIL_FROM,
                to: to,
                subject: 'Reset Your Password',
                html: `
        <h1>Password Reset</h1>
        <p>You have requested to reset your password. Please click the link below to set a new password:</p>
        <a href="${resetPasswordLink}">Reset Password</a>
        <p>If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
        <p>This link will expire in 1 hour.</p>
      `,
            };
            try {
                yield this.transporter.sendMail(mailOptions);
            }
            catch (error) {
                console.error('Error sending password reset email:', error);
                throw new Error('Failed to send password reset email');
            }
        });
    }
}
exports.EmailService = EmailService;
