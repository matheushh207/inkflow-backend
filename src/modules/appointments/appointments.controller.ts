import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionGuard } from '../billing/subscription.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('appointments')
@UseGuards(AuthGuard('jwt'), SubscriptionGuard)
export class AppointmentController {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService
    ) { }

    @Post()
    async create(@Body() data: any) {
        const token = uuidv4();

        // Find tenant and client to get email and SMTP settings
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: data.tenantId }
        });

        const client = await this.prisma.client.findUnique({
            where: { id: data.clientId }
        });

        if (!tenant || !client) {
            throw new Error('Tenant or Client not found');
        }

        const appointment = await this.prisma.appointment.create({
            data: {
                date: new Date(data.date),
                duration: data.duration || 60,
                status: 'PENDING',
                clientId: data.clientId,
                userId: data.userId,
                tenantId: data.tenantId,
                value: data.value,
                commission: data.commission || 0,
                confirmationToken: token,
            }
        });

        // Send confirmation email using tenant SMTP settings
        if (tenant.mailHost && client.email) {
            await this.mailService.sendAppointmentConfirmation(
                client.email,
                client.name,
                new Date(data.date).toLocaleString('pt-BR'),
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

        return appointment;
    }
    
    @Get()
    async findAll() {
        // The TenantInterceptor/PrismaService already handles tenant filtering
        return this.prisma.appointment.findMany({
            orderBy: { date: 'asc' },
            include: { client: true, artist: true }
        });
    }
}
