import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    getStatus() {
        return { status: "ok", message: "InkFlow Backend Online 🚀" };
    }

    @Get('test-db')
    async testDb() {
        try {
            const tenants = await this.prisma.tenant.findMany({ take: 1 });
            return {
                status: "connected",
                database: "PostgreSQL",
                tenantsCount: tenants.length
            };
        } catch (error) {
            return {
                status: "error",
                message: "Database connection failed",
                error: error.message
            };
        }
    }
}
