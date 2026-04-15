import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        
        if (!user || !requiredRoles.some((role) => user.role?.includes(role))) {
            throw new ForbiddenException('You do not have permission to access this resource');
        }

        // Restrição Adicional e Rigorosa: Apenas admin@inkflow.com pode usar a role SUPER_ADMIN
        const isSuperAdmin = user.role === 'SUPER_ADMIN';
        const isAuthorizedEmail = user.email === 'admin@inkflow.com';

        if (isSuperAdmin && !isAuthorizedEmail) {
            console.error(`Tentativa de acesso SuperAdmin por e-mail não autorizado: ${user.email}`);
            throw new ForbiddenException('Acesso negado: Este e-mail não tem permissão para usar privilégios de Super Admin');
        }
        
        return true;
    }
}
