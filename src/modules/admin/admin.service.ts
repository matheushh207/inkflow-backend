import { MailService } from '../mail/mail.service';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private mailService: MailService
    ) { }

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
                _count: {
                    select: {
                        clients: true,
                        budgets: true
                    }
                }
            }
        });
    }

    async updateTenantDiscount(id: string, discount: number) {
        const tenant = await this.prisma.tenant.update({
            where: { id },
            data: { discount },
            include: { 
                users: { where: { role: 'ADMIN' } } 
            }
        });

        // Trigger email if discount > 0 and tenant has SMTP or we use system default
        if (discount > 0 && tenant.mailHost) {
            await this.mailService.sendDiscountNotification(
                tenant.users[0].email,
                tenant.name,
                discount,
                {
                    host: tenant.mailHost,
                    port: tenant.mailPort,
                    secure: tenant.mailSecure,
                    user: tenant.mailUser,
                    pass: tenant.mailPass
                }
            );
        }

        return tenant;
    }

    async extendSubscription(tenantId: string, days: number, isLifetime: boolean = false) {
        const subscription = await this.prisma.subscription.findFirst({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });

        if (!subscription) throw new Error('Assinatura não encontrada');

        let newExpiration = new Date();
        
        if (isLifetime) {
            // "Vitalício" set to year 2099
            newExpiration = new Date('2099-12-31T23:59:59Z');
        } else {
            // Extend from current expiration or from now if already expired
            const currentExp = subscription.expiresAt || new Date();
            const baseDate = currentExp > new Date() ? currentExp : new Date();
            newExpiration = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);
        }

        return this.prisma.subscription.update({
            where: { id: subscription.id },
            data: { 
                expiresAt: newExpiration,
                status: 'ACTIVE' // Ensure it's active if extended
            }
        });
    }
}
