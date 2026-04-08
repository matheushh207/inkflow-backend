import { Controller, Get, Query, Patch, Param, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('confirmations')
export class ConfirmationController {
    constructor(private prisma: PrismaService) { }

    @Get('appointment')
    async confirmAppointment(@Query('token') token: string) {
        if (!token) throw new BadRequestException('Token is required');

        const appointment = await this.prisma.appointment.findUnique({
            where: { confirmationToken: token },
        });

        if (!appointment) throw new BadRequestException('Invalid or expired token');

        return await this.prisma.appointment.update({
            where: { id: appointment.id },
            data: {
                status: 'CONFIRMED',
                confirmationToken: null // Clear token after use
            },
        });
    }

    @Get('budget')
    async confirmBudget(@Query('token') token: string) {
        if (!token) throw new BadRequestException('Token is required');

        const budget = await this.prisma.budget.findUnique({
            where: { confirmationToken: token },
        });

        if (!budget) throw new BadRequestException('Invalid or expired token');

        return await this.prisma.budget.update({
            where: { id: budget.id },
            data: {
                status: 'DEPOSIT_PAID', // Assuming DEPOSIT_PAID is the next step for budget
                confirmationToken: null
            },
        });
    }
}
