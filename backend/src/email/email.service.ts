import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: this.configService.get('SMTP_PORT'),
      auth: {
        user: this.configService.get('SMTP_USER'),
        pass: this.configService.get('SMTP_PASS'),
      },
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const appUrl = this.configService.get('APP_URL');
    const resetLink = `${appUrl}/reset-password/${token}`;

    const mailOptions = {
      from: this.configService.get('SMTP_FROM'),
      to: email,
      subject: 'Deneme Takip Sistemi - Şifre Sıfırlama',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Şifre Sıfırlama İsteği</h2>
          <p>Hesabınız için şifre sıfırlama isteği aldık.</p>
          <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Şifremi Sıfırla</a>
          </div>
          <p>Bu isteği siz yapmadıysanız, bu emaili görmezden gelebilirsiniz.</p>
          <p>Link 1 saat süreyle geçerlidir.</p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendEmail(to: string, subject: string, html: string) {
    const mailOptions = {
      from: this.configService.get('SMTP_FROM'),
      to,
      subject,
      html,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
