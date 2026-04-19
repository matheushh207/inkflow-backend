import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { PrismaService } from '../../prisma/prisma.service';

interface TenantContext {
    tenantId?: string;
    role?: string;
}

const tenantAsyncLocalStorage = new AsyncLocalStorage<TenantContext>();

@Injectable()
export class TenantService {
    constructor(
        @Inject(forwardRef(() => PrismaService))
        private prisma: PrismaService
    ) {}

    static getTenantAsyncLocalStorage() {
        return tenantAsyncLocalStorage;
    }

    setTenantId(id: string) {
        const store = tenantAsyncLocalStorage.getStore();
        if (store) {
            store.tenantId = id;
        }
    }

    getTenantId(): string {
        const store = tenantAsyncLocalStorage.getStore();
        return store?.tenantId || '';
    }

    setRole(role: string) {
        const store = tenantAsyncLocalStorage.getStore();
        if (store) {
            store.role = role;
        }
    }

    getRole(): string {
        const store = tenantAsyncLocalStorage.getStore();
        return store?.role || '';
    }

    async getTenantProfile() {
        const tenantId = this.getTenantId();
        if (!tenantId) throw new NotFoundException('Tenant not identified');
        
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
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
        const tenantId = this.getTenantId();
        if (!tenantId) throw new NotFoundException('Tenant not identified');

        const { name, cnpj, phone, logo, slug, primaryColor, responsibleName, email } = data;

        // Update Tenant Info
        const updatedTenant = await this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                name: name,
                cnpj: cnpj,
                phone: phone,
                logoUrl: logo,
                slug: slug,
                primaryColor: primaryColor
            }
        });

        // Update Admin User Info if provided
        if (responsibleName || email) {
            const adminUser = await this.prisma.user.findFirst({
                where: { tenantId: tenantId, role: 'ADMIN' }
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

    async updateSmtpSettings(data: any) {
        const tenantId = this.getTenantId();
        if (!tenantId) throw new NotFoundException('Tenant not identified');

        return this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                mailHost: data.host,
                mailPort: data.port,
                mailUser: data.user,
                mailPass: data.pass,
                mailSecure: data.secure
            }
        });
    }

    async findPublicBySlug(slug: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug },
            include: {
                users: {
                    where: { role: 'ARTIST' },
                    select: { id: true, name: true }
                }
            }
        });

        if (!tenant) throw new NotFoundException('Estúdio não encontrado');

        return {
            id: tenant.id,
            name: tenant.name,
            logo: tenant.logoUrl,
            phone: tenant.phone,
            primaryColor: tenant.primaryColor,
            artists: tenant.users.map(u => ({ id: u.id, name: u.name }))
        };
    }
}
