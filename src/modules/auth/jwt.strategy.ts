import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET || 'inkflow_secret_key_2026_matheus',
        });
    }

    async validate(payload: any) {
        console.log(`[JWT] Validando payload: ${payload.email} [${payload.role}]`);
        return { 
            userId: payload.sub, 
            email: payload.email, 
            tenantId: payload.tenantId, 
            role: payload.role 
        };
    }
}
