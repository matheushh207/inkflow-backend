import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@prisma/client';

@Injectable()
export class InvitationsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async createInvitation(data: {
    email: string;
    role: UserRole;
    tenantId: string;
  }) {
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invitation = await this.prisma.invitation.create({
      data: {
        email: data.email,
        role: data.role,
        token,
        tenantId: data.tenantId,
        expiresAt,
      },
    });

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: data.tenantId },
    });

    // Send invitation email
    if (tenant?.mailHost) {
      // Assuming mailService has a generic wrap or we add sendInvitation
      // For now, let's assume we use a professional template link
      const inviteUrl = `${process.env.FRONTEND_URL || 'https://inkflow-crm.onrender.com'}/register?token=${token}`;
      
      await this.mailService.sendGenericEmail({
        to: data.email,
        subject: `Convite para participar do estúdio ${tenant.name}`,
        html: `
          <h1>Olá!</h1>
          <p>Você foi convidado para participar da equipe do estúdio <strong>${tenant.name}</strong> no INK FLOW CRM.</p>
          <p>Seu cargo será: <strong>${data.role}</strong></p>
          <p>Clique no link abaixo para criar sua conta e acessar o sistema:</p>
          <a href="${inviteUrl}" style="padding: 10px 20px; background: #FFD700; color: #000; text-decoration: none; border-radius: 5px; font-weight: bold;">Aceitar Convite</a>
          <br/><br/>
          <p>Este convite expira em 7 dias.</p>
        `,
        smtp: {
          host: tenant.mailHost,
          port: tenant.mailPort,
          secure: tenant.mailSecure,
          user: tenant.mailUser,
          pass: tenant.mailPass,
        }
      });
    }

    return invitation;
  }

  async acceptInvitation(token: string, passwordHash: string, name: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation || invitation.expiresAt < new Date()) {
      throw new Error('Convite inválido ou expirado');
    }

    // Create the user
    const user = await this.prisma.user.create({
      data: {
        email: invitation.email,
        password: passwordHash,
        name: name,
        role: invitation.role,
        tenantId: invitation.tenantId,
      },
    });

    // Delete the invitation
    await this.prisma.invitation.delete({
      where: { id: invitation.id },
    });

    return user;
  }
}
