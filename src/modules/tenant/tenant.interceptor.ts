import { Injectable, NestInterceptor, ExecutionContext, CallHandler, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantService } from './tenant.service';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
    constructor(private readonly tenantService: TenantService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (user) {
            // Validate if user has a tenantId
            if (!user.tenantId && user.role !== 'SUPER_ADMIN') {
                throw new ForbiddenException('User has no tenant assigned');
            }

            // Set tenantId and role in the request-scoped service
            this.tenantService.setTenantId(user.tenantId);
            this.tenantService.setRole(user.role);
        }

        return next.handle();
    }
}
