import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantService } from '../modules/tenant/tenant.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor(private readonly tenantService: TenantService) {
        super();
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

    // Helper to get a pre-filtered query object
    get tenantClient() {
        const tenantId = this.tenantService.getTenantId();
        
        // Return a proxy that automatically injects tenantId into where clauses
        return new Proxy(this, {
            get: (target, prop) => {
                const originalModel = target[prop];
                if (typeof originalModel === 'object' && originalModel !== null) {
                    return new Proxy(originalModel, {
                        get: (modelTarget, operation) => {
                            const originalOperation = modelTarget[operation];
                            if (typeof originalOperation === 'function') {
                                return (...args) => {
                                    const params = args[0] || {};
                                    if (tenantId && target.tenantService.getRole() !== 'SUPER_ADMIN') {
                                        params.where = {
                                            ...params.where,
                                            tenantId: tenantId
                                        };
                                    }
                                    return originalOperation.apply(modelTarget, [params]);
                                };
                            }
                            return originalOperation;
                        }
                    });
                }
                return originalModel;
            }
        });
    }
}
