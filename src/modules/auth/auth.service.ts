import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { email },
            include: { tenant: true }
        });

        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { 
            email: user.email, 
            sub: user.id, 
            tenantId: user.tenantId, 
            role: user.role 
        };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                tenantId: user.tenantId
            }
        };
    }

    async register(data: any) {
        const hashedFileName = await bcrypt.hash(data.password, 10);
        
        // Create Tenant first
        const tenant = await this.prisma.tenant.create({
            data: {
                name: data.studioName,
                slug: data.studioName.toLowerCase().replace(/ /g, '-'),
            }
        });

        // Create User linked to Tenant
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                password: hashedFileName,
                name: data.name,
                role: 'ADMIN',
                tenantId: tenant.id
            }
        });

        return this.login(user);
    }
}
