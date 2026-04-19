import { Controller, Post, Get, Body, UseGuards, Param, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionGuard } from '../billing/subscription.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { NotificationsService } from '../notifications/notifications.service';
import { v4 as uuidv4 } from 'uuid';
import { NotificationType } from '@prisma/client';

@Controller('budgets')
@UseGuards(AuthGuard('jwt'), SubscriptionGuard)
export class BudgetController {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
        private notificationsService: NotificationsService
    ) { }

    @Get()
    async findAll(@Request() req) {
        const tenantId = req.user.tenantId;
        // Trigger old budget check periodically when listing
        await this.notificationsService.notifyOldBudgets();
        
        return this.prisma.budget.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });
    }

    @Post()
    async create(@Body() data: any) {
        const token = uuidv4();

        const tenant = await this.prisma.tenant.findUnique({
            where: { id: data.tenantId }
        });

        if (!tenant) {
            throw new Error('Tenant not found');
        }

        const budget = await this.prisma.budget.create({
            data: {
                title: data.title,
                clientName: data.clientName,
                value: data.value,
                status: 'NEW',
                source: data.source,
                tenantId: data.tenantId,
                confirmationToken: token,
            }
        });

        // Send confirmation email using tenant SMTP settings
        // Assuming budget info has a client's email... but Budget model's clientName is string.
        // If there's an email in the payload, use it.
        if (tenant.mailHost && data.clientEmail) {
            await this.mailService.sendBudgetConfirmation(
                data.clientEmail,
                data.clientName,
                data.title,
                token,
                {
                    host: tenant.mailHost,
                    port: tenant.mailPort,
                    secure: tenant.mailSecure,
                    user: tenant.mailUser,
                    pass: tenant.mailPass
                }
            );
        }

        return budget;
    }
}

@Controller('public/budgets')
export class PublicBudgetController {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService,
        private notificationsService: NotificationsService
    ) { }

    @Post(':slug')
    async createPublic(@Param('slug') slug: string, @Body() data: any) {
        const token = uuidv4();

        const tenant = await this.prisma.tenant.findUnique({
            where: { slug }
        });

        if (!tenant) throw new Error('Estúdio não encontrado');

        const budget = await this.prisma.budget.create({
            data: {
                title: data.title,
                clientName: data.clientName,
                value: data.value,
                status: 'NEW',
                source: 'Reserva Online',
                description: data.description,
                images: data.images || [],
                tenantId: tenant.id,
                confirmationToken: token,
            }
        });

        if (tenant.mailHost && data.clientEmail) {
            await this.mailService.sendBudgetConfirmation(
                data.clientEmail,
                data.clientName,
                data.title,
                token,
                {
                    host: tenant.mailHost,
                    port: tenant.mailPort,
                    secure: tenant.mailSecure,
                    user: tenant.mailUser,
                    pass: tenant.mailPass
                }
            );
        }

        return budget;
    }
}
