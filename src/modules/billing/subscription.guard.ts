import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Skip check for public routes or Super Admins
        if (!user || user.role === 'SUPER_ADMIN') {
            return true;
        }

        const subscription = await this.prisma.subscription.findFirst({
            where: { 
                tenantId: user.tenantId,
                status: 'ACTIVE',
                expiresAt: { gte: new Date() }
            }
        });

        if (!subscription) {
            throw new ForbiddenException('Assinatura inativa ou pendente. Por favor, regularize seu pagamento para continuar usando o sistema.');
        }

        return true;
    }
}
