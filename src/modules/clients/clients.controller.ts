import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionGuard } from '../billing/subscription.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';

@Controller('clients')
@UseGuards(AuthGuard('jwt'), SubscriptionGuard)
export class ClientController {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService
    ) { }

    @Get()
    async findAll() {
        const tenantId = this.tenantService.getTenantId();
        return this.prisma.client.findMany({
            where: { tenantId },
            orderBy: { name: 'asc' }
        });
    }

    @Post()
    async create(@Body() data: any) {
        const tenantId = this.tenantService.getTenantId();
        return this.prisma.client.create({
            data: {
                ...data,
                tenantId
            }
        });
    }
}
