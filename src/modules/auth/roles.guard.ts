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
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        
        console.log(`[ACL] Verificando acesso: ${user?.email || 'N/A'} [${user?.role || 'N/A'}] para recurso que exige [${requiredRoles.join(', ')}]`);
        
        if (!user) {
            console.log(`[ACL] Bloqueio: Usuário não presente no request (AuthGuard falhou ou não executou)`);
            throw new ForbiddenException('User authentication required');
        }

        const userRole = user.role;
        const hasRole = requiredRoles.some((role) => userRole === role);

        if (!hasRole) {
            console.log(`[ACL] Bloqueio por Role: Usuário possui [${userRole || 'N/A'}] mas é necessário [${requiredRoles.join(', ')}]`);
            throw new ForbiddenException('You do not have permission to access this resource');
        }

        // Restrição Adicional e Rigorosa: Apenas admin@inkflow.com pode usar a role SUPER_ADMIN
        const isSuperAdmin = user.role === 'SUPER_ADMIN';
        const isAuthorizedEmail = user.email === 'admin@inkflow.com';

        if (isSuperAdmin && !isAuthorizedEmail) {
            console.log(`[ACL] Bloqueio por E-mail: Role SUPER_ADMIN detectada para e-mail não autorizado: ${user.email}`);
            throw new ForbiddenException('Acesso negado: Este e-mail não tem permissão para usar privilégios de Super Admin');
        }
        
        return true;
    }
}
