import { Injectable, Scope, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable({ scope: Scope.REQUEST })
export class TenantService {
    private tenantId: string;
    private role: string;

    constructor(private prisma: PrismaService) {}

    setTenantId(id: string) {
        this.tenantId = id;
    }

    getTenantId(): string {
        return this.tenantId;
    }

    setRole(role: string) {
        this.role = role;
    }

    getRole(): string {
        return this.role;
    }

    async getTenantProfile() {
        if (!this.tenantId) throw new NotFoundException('Tenant not identified');
        
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: this.tenantId },
            include: {
                users: {
                    where: { role: 'ADMIN' },
                    select: { name: true, email: true }
                }
            }
        });

        if (!tenant) throw new NotFoundException('Tenant not found');

        return {
            id: tenant.id,
            name: tenant.name,
            slug: tenant.slug,
            email: tenant.users[0]?.email || '',
            responsibleName: tenant.users[0]?.name || '',
            cnpj: tenant.cnpj || '',
            phone: tenant.phone || '',
            logo: tenant.logoUrl || '',
            mailHost: tenant.mailHost,
            mailPort: tenant.mailPort,
            mailUser: tenant.mailUser,
            mailSecure: tenant.mailSecure,
        };
    }

    async updateTenantProfile(data: any) {
        if (!this.tenantId) throw new NotFoundException('Tenant not identified');

        const { name, cnpj, phone, logo, responsibleName, email } = data;

        // Update Tenant Info
        const updatedTenant = await this.prisma.tenant.update({
            where: { id: this.tenantId },
            data: {
                name: name,
                cnpj: cnpj,
                phone: phone,
                logoUrl: logo
            }
        });

        // Update Admin User Info if provided
        if (responsibleName || email) {
            const adminUser = await this.prisma.user.findFirst({
                where: { tenantId: this.tenantId, role: 'ADMIN' }
            });

            if (adminUser) {
                await this.prisma.user.update({
                    where: { id: adminUser.id },
                    data: {
                        name: responsibleName || adminUser.name,
                        email: email || adminUser.email
                    }
                });
            }
        }

        return updatedTenant;
    }
}
