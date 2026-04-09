import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
    constructor(private prisma: PrismaService) { }

    async getGlobalStats() {
        const totalTenants = await this.prisma.tenant.count();
        const activeSubscriptions = await this.prisma.subscription.count({
            where: { status: 'ACTIVE' }
        });

        // Sum revenue from PAID payments
        const totalRevenue = await this.prisma.payment.aggregate({
            where: { status: 'PAID' },
            _sum: { amount: true }
        });

        // New studios today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const newTenantsToday = await this.prisma.tenant.count({
            where: { createdAt: { gte: today } }
        });

        // Expiring trials (next 48h)
        const in48h = new Date();
        in48h.setHours(in48h.getHours() + 48);
        const trialsExpiring = await this.prisma.subscription.count({
            where: {
                status: 'ACTIVE',
                expiresAt: {
                    gte: new Date(),
                    lte: in48h
                }
            }
        });

        return {
            totalTenants,
            activeSubscriptions,
            totalRevenue: Number(totalRevenue._sum.amount || 0),
            newTenantsToday,
            trialsExpiring
        };
    }

    async getAllTenants() {
        return this.prisma.tenant.findMany({
            include: {
                subscriptions: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    include: { plan: true }
                },
                users: {
                    where: { role: 'ADMIN' },
                    select: { email: true, name: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async getTenantDetails(tenantId: string) {
        return this.prisma.tenant.findUnique({
            where: { id: tenantId },
            include: {
                users: true,
                subscriptions: {
                    include: {
                        plan: true,
                        payments: true
                    }
                },
                appointments: { take: 5, orderBy: { date: 'desc' } },
                clients: { _count: true },
                budgets: { _count: true }
            }
        });
    }
}
