import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TenantService } from './tenant.service';

@Controller('tenants')
@UseGuards(AuthGuard('jwt'))
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
