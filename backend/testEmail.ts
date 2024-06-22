import { EmailService } from './src/services/EmailService'; // EmailService dosyanızın doğru yolunu yazın
import dotenv from 'dotenv';

dotenv.config();

async function testSendEmail() {
  const emailService = new EmailService();

  try {
    await emailService.sendVerificationEmail('test-recipient@example.com', 'test-token');
    console.log('Email gönderimi başarılı');
  } catch (error) {
    console.error('Email gönderimi başarısız:', error);
  }
}

testSendEmail();
