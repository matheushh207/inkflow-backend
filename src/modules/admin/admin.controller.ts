import { Controller, Get, UseGuards, SetMetadata, Param, Patch, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
    constructor(private adminService: AdminService) { }

    @Get('stats')
    @SetMetadata('roles', ['MASTER'])
    async getStats() {
        return this.adminService.getGlobalStats();
    }

    @Get('tenants')
    @SetMetadata('roles', ['MASTER'])
    async getTenants() {
        return this.adminService.getAllTenants();
    }

    @Patch('tenants/:id/discount')
    @SetMetadata('roles', ['MASTER'])
    async setDiscount(@Param('id') id: string, @Body('discount') discount: number) {
        return this.adminService.updateTenantDiscount(id, discount);
    }

    @Patch('tenants/:id/extend')
    @SetMetadata('roles', ['MASTER'])
    async extendSubscription(
        @Param('id') id: string, 
        @Body('days') days: number,
        @Body('isLifetime') isLifetime: boolean
    ) {
        return this.adminService.extendSubscription(id, days, isLifetime);
    }

    @Get('tenants/:id')
    @SetMetadata('roles', ['MASTER'])
    async getTenantDetails(@Param('id') id: string) {
        return this.adminService.getTenantDetails(id);
    }
}
