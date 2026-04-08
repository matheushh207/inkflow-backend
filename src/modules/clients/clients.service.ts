import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';

@Injectable()
export class ClientsService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService
    ) { }

    // Automatic isolation using the 'tenantClient' proxy
    findAll() {
        return this.prisma.tenantClient.client.findMany();
    }

    findOne(id: string) {
        return this.prisma.tenantClient.client.findUnique({
            where: { id }
        });
    }

    create(data: any) {
        return this.prisma.tenantClient.client.create({
            data: {
                ...data,
                tenantId: this.tenantService.getTenantId()
            }
        });
    }

    update(id: string, data: any) {
        return this.prisma.tenantClient.client.update({
            where: { id },
            data
        });
    }

    remove(id: string) {
        return this.prisma.tenantClient.client.delete({
            where: { id }
        });
    }
}
