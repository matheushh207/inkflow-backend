import { Controller, Patch, Body, Param, Get, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('tenants')
export class TenantController {
    constructor(private prisma: PrismaService) { }

    @Get(':id')
    async getTenant(@Param('id') id: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
        });
        if (!tenant) throw new NotFoundException('Tenant not found');
        return tenant;
    }

    @Patch(':id/smtp')
    async updateSmtp(
        @Param('id') id: string,
        @Body() data: { host: string; port: number; secure: boolean; user: string; pass: string }
    ) {
        return await this.prisma.tenant.update({
            where: { id },
            data: {
                mailHost: data.host,
                mailPort: data.port,
                mailSecure: data.secure,
                mailUser: data.user,
                mailPass: data.pass,
            },
        });
    }
}
