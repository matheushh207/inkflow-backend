import { Controller, Get, Post, Body, UseGuards, Delete, Param } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionGuard } from '../billing/subscription.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';

@Controller('financial')
@UseGuards(AuthGuard('jwt'), SubscriptionGuard)
export class FinancialController {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService
    ) { }

    @Get()
    async findAll() {
        const tenantId = this.tenantService.getTenantId();
        return this.prisma.financialRecord.findMany({
            where: { tenantId },
            orderBy: { date: 'desc' }
        });
    }

    @Post()
    async create(@Body() data: any) {
        const tenantId = this.tenantService.getTenantId();
        return this.prisma.financialRecord.create({
            data: {
                type: data.type,
                amount: data.amount,
                category: data.category,
                method: data.method,
                date: data.date ? new Date(data.date) : new Date(),
                tenantId
            }
        });
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        return this.prisma.financialRecord.delete({
            where: { id }
        });
    }
}
