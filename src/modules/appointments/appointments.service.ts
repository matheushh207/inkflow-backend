import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';

@Injectable()
export class AppointmentsService {
    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService
    ) { }

    findAll() {
        return this.prisma.appointment.findMany({
            where: { tenantId: this.tenantService.getTenantId() },
            include: { client: true, artist: true }
        });
    }

    create(data: any) {
        return this.prisma.appointment.create({
            data: {
                ...data,
                tenantId: this.tenantService.getTenantId()
            }
        });
    }
}
