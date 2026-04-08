import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class TenantService {
    private tenantId: string;
    private role: string;

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
}
