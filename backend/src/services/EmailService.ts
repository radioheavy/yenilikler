import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendVerificationEmail(to: string, token: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: to,
      subject: 'Verify Your Email',
      html: `
        <div style="font-family: 'Nunito', sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; padding-bottom: 20px;">
            <h1 style="color: #333;">Email Verification</h1>
          </div>
          <div style="background-color: white; padding: 20px; border-radius: 10px;">
            <p style="font-size: 16px; color: #555;">Your verification code is:</p>
            <h2 style="text-align: center; color: #007BFF;">${token}</h2>
            <p style="font-size: 16px; color: #555;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendResetPasswordEmail(to: string, token: string): Promise<void> {
    const resetPasswordLink = `${process.env.APP_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: to,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: 'Nunito', sans-serif; max-width: 600px; margin: auto; padding: 20px; background-color: #f4f4f4; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; padding-bottom: 20px;">
            <h1 style="color: #333;">Password Reset</h1>
          </div>
          <div style="background-color: white; padding: 20px; border-radius: 10px;">
            <p style="font-size: 16px; color: #555;">You have requested to reset your password. Please click the link below to set a new password:</p>
            <p style="text-align: center;"><a href="${resetPasswordLink}" style="font-size: 18px; color: #007BFF;">Reset Password</a></p>
            <p style="font-size: 16px; color: #555;">If you didn't request this, you can safely ignore this email. Your password will remain unchanged.</p>
            <p style="font-size: 14px; color: #999;">This link will expire in 1 hour.</p>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}
