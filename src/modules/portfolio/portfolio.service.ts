import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';

@Injectable()
export class PortfolioService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService
    ) {}

    async findAll() {
        const tenantId = this.tenantService.getTenantId();
        return this.prisma.portfolioItem.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });
    }

    async findPublicBySlug(slug: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug }
        });

        if (!tenant) throw new NotFoundException('Estúdio não encontrado');

        return this.prisma.portfolioItem.findMany({
            where: { 
                tenantId: tenant.id,
                isVisible: true 
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async create(data: any) {
        const tenantId = this.tenantService.getTenantId();
        return this.prisma.portfolioItem.create({
            data: {
                ...data,
                tenantId
            }
        });
    }

    async update(id: string, data: any) {
        const tenantId = this.tenantService.getTenantId();
        
        const item = await this.prisma.portfolioItem.findFirst({
            where: { id, tenantId }
        });

        if (!item) throw new NotFoundException('Item não encontrado ou acesso negado');

        return this.prisma.portfolioItem.update({
            where: { id },
            data
        });
    }

    async delete(id: string) {
        const tenantId = this.tenantService.getTenantId();
        
        const item = await this.prisma.portfolioItem.findFirst({
            where: { id, tenantId }
        });

        if (!item) throw new NotFoundException('Item não encontrado ou acesso negado');

        return this.prisma.portfolioItem.delete({
            where: { id }
        });
    }

    async incrementViews(id: string) {
        return this.prisma.portfolioItem.update({
            where: { id },
            data: { views: { increment: 1 } }
        });
    }

    async toggleLike(id: string) {
        // Simple increment for now, could be more complex with user tracking
        return this.prisma.portfolioItem.update({
            where: { id },
            data: { likes: { increment: 1 } }
        });
    }
}
