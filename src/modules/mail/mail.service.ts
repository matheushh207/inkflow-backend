import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

@Injectable()
export class MailService {
  private createTransporter(config: SmtpConfig) {
    return nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  async sendAppointmentConfirmation(
    email: string,
    clientName: string,
    date: string,
    token: string,
    config: SmtpConfig
  ) {
    const transporter = this.createTransporter(config);
    const confirmationLink = `${process.env.FRONTEND_URL}/confirm-appointment?token=${token}`;

    const mailOptions = {
      from: `"INK FLOW" <${config.user}>`,
      to: email,
      subject: 'Confirmação de Agendamento - INK FLOW',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #FFD700; text-align: center;">Olá, ${clientName}!</h2>
          <p>Seu agendamento para o dia <strong>${date}</strong> foi pré-reservado.</p>
          <p>Para confirmar sua presença, clique no botão abaixo:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationLink}" style="background-color: #FFD700; color: #000; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">CONFIRMAR AGENDAMENTO</a>
          </div>
          <p style="font-size: 12px; color: #666;">Se você não realizou este agendamento, por favor desconsidere este e-mail.</p>
        </div>
      `,
    };

    return transporter.sendMail(mailOptions);
  }

  async sendBudgetConfirmation(
    email: string,
    clientName: string,
    title: string,
    token: string,
    config: SmtpConfig
  ) {
    const transporter = this.createTransporter(config);
    const confirmationLink = `${process.env.FRONTEND_URL}/confirm-budget?token=${token}`;

    const mailOptions = {
      from: `"INK FLOW" <${config.user}>`,
      to: email,
      subject: 'Confirmação de Orçamento - INK FLOW',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #FFD700; text-align: center;">Olá, ${clientName}!</h2>
          <p>Seu orçamento <strong>"${title}"</strong> está pronto para revisão e confirmação.</p>
          <p>Para aprovar e prosseguir, clique no botão abaixo:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationLink}" style="background-color: #FFD700; color: #000; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">APROVAR ORÇAMENTO</a>
          </div>
          <p style="font-size: 12px; color: #666;">Se você tiver dúvidas, entre em contato conosco.</p>
        </div>
      `,
    };

    return transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(
    email: string,
    name: string,
    token: string,
    config: SmtpConfig
  ) {
    const transporter = this.createTransporter(config);
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"INK FLOW" <${config.user}>`,
      to: email,
      subject: 'Recuperação de Senha - INK FLOW',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #FFD700; text-align: center;">Olá, ${name}!</h2>
          <p>Você solicitou a recuperação da sua senha no **INK FLOW**.</p>
          <p>Para definir uma nova senha, clique no botão abaixo em até 1 hora:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #FFD700; color: #000; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">REDEFINIR MINHA SENHA</a>
          </div>
          <p style="font-size: 12px; color: #666;">Se você não solicitou esta alteração, pode ignorar este e-mail com segurança.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 10px; color: #999; text-align: center;">Ink Flow Management System // Precision & Style</p>
        </div>
      `,
    };

    return transporter.sendMail(mailOptions);
  async sendGenericEmail(data: {
    to: string;
    subject: string;
    html: string;
    smtp: SmtpConfig;
  }) {
    const transporter = this.createTransporter(data.smtp);
    const mailOptions = {
      from: `"INK FLOW" <${data.smtp.user}>`,
      to: data.to,
      subject: data.subject,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          ${data.html}
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 10px; color: #999; text-align: center;">Ink Flow Management System // Precision & Style</p>
        </div>
      `,
    };
    return transporter.sendMail(mailOptions);
  }

  async sendDiscountNotification(
    email: string,
    name: string,
    percentage: number,
    config: SmtpConfig
  ) {
    const transporter = this.createTransporter(config);
    const checkoutLink = `${process.env.FRONTEND_URL}/billing`;

    const mailOptions = {
      from: `"INK FLOW Master" <${config.user}>`,
      to: email,
      subject: `🎁 Você recebeu um desconto especial para o estúdio ${name}!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #1a1a1a; border-radius: 10px; background-color: #0A0A0A; color: #fff;">
          <h2 style="color: #FFD700; text-align: center;">Parabéns, ${name}!</h2>
          <p style="text-align: center; font-size: 18px;">A Torre de Comando liberou um cupom de <strong>${percentage}% DE DESCONTO</strong> para sua próxima renovação.</p>
          <p style="text-align: center; color: #999;">Aproveite esta oportunidade para manter sua gestão em alto nível com o melhor preço.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${checkoutLink}" style="background-color: #7B2CBF; color: #fff; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; border: 1px solid #FFD700;">RESGATAR MEU DESCONTO</a>
          </div>
          <p style="font-size: 12px; color: #666; text-align: center;">O desconto será aplicado automaticamente no seu próximo QR Code de pagamento.</p>
          <hr style="border: 0; border-top: 1px solid #333; margin: 20px 0;" />
          <p style="font-size: 10px; color: #444; text-align: center;">Ink Flow Management System // Luxury & Control</p>
        </div>
      `,
    };

    return transporter.sendMail(mailOptions);
  }
}

