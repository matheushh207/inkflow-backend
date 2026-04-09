import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private mailService: MailService
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { tenant: true }
        });

        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { 
            email: user.email, 
            sub: user.id, 
            tenantId: user.tenantId, 
            role: user.role 
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                tenantId: user.tenantId
            }
        };
    }

    async register(data: any) {
        const hashedFileName = await bcrypt.hash(data.password, 10);
        
        // Create Tenant first
        const tenant = await this.prisma.tenant.create({
            data: {
                name: data.studioName,
                slug: data.studioName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''),
            }
        });

        // Create User linked to Tenant
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                password: hashedFileName,
                name: data.name,
                role: 'ADMIN',
                tenantId: tenant.id
            }
        });

        // ATIVAÇÃO AUTOMÁTICA SAAS: Criar Assinatura de Teste (5 dias)
        const fiveDaysFromNow = new Date();
        fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

        await this.prisma.subscription.create({
            data: {
                tenantId: tenant.id,
                planId: data.planId || 'solo', // Usa o plano escolhido ou 'solo' como padrão
                status: 'ACTIVE',
                expiresAt: fiveDaysFromNow
            }
        });

        return this.login(user);
    }

    async forgotPassword(email: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { tenant: true }
        });

        // Security: Don't reveal if user exists
        if (!user) return { message: 'Se o e-mail estiver cadastrado, um link de recuperação será enviado.' };

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // 1 hour validity

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                resetPasswordToken: token,
                resetPasswordExpires: expires
            }
        });

        // Use global SMTP from ENV as fallback if tenant hasn't configured its own
        const smtpConfig = {
            host: user.tenant.mailHost || process.env.MAIL_HOST || '',
            port: Number(user.tenant.mailPort) || Number(process.env.MAIL_PORT) || 587,
            secure: user.tenant.mailSecure || process.env.MAIL_SECURE === 'true',
            user: user.tenant.mailUser || process.env.MAIL_USER || '',
            pass: user.tenant.mailPass || process.env.MAIL_PASS || '',
        };

        if (smtpConfig.host && smtpConfig.user) {
            await this.mailService.sendPasswordResetEmail(user.email, user.name, token, smtpConfig);
        }

        return { message: 'Se o e-mail estiver cadastrado, um link de recuperação será enviado.' };
    }

    async resetPassword(token: string, newPass: string) {
        const user = await this.prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { gt: new Date() }
            }
        });

        if (!user) {
            throw new BadRequestException('Token inválido ou expirado.');
        }

        const hashedPassword = await bcrypt.hash(newPass, 10);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null
            }
        });

        return { message: 'Senha redefinida com sucesso!' };
    }
}
