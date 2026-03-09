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
}

