import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantService } from './tenant.service';

import { SubscriptionGuard } from '../billing/subscription.guard';

@Controller('tenants')
@UseGuards(AuthGuard('jwt'), SubscriptionGuard)
export class TenantController {
    constructor(private readonly tenantService: TenantService) {}

    @Get('profile')
    async getProfile() {
        return this.tenantService.getTenantProfile();
    }

    @Patch('profile')
    async updateProfile(@Body() data: any) {
        return this.tenantService.updateTenantProfile(data);
    }
}
