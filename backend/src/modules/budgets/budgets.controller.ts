import { Controller, Post, Body } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('budgets')
export class BudgetController {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService
    ) { }

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
