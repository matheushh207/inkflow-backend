import { Controller, Get, UseGuards, SetMetadata, Param, Patch, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
    constructor(private adminService: AdminService) { }

    @Get('stats')
    @SetMetadata('roles', ['SUPER_ADMIN'])
    async getStats() {
        return this.adminService.getGlobalStats();
    }

    @Get('tenants')
    @SetMetadata('roles', ['SUPER_ADMIN'])
    async getTenants() {
        return this.adminService.getAllTenants();
    }

    @Patch('tenants/:id/discount')
    @SetMetadata('roles', ['SUPER_ADMIN'])
    async setDiscount(@Param('id') id: string, @Body('discount') discount: number) {
        return this.adminService.updateTenantDiscount(id, discount);
    }

    @Get('tenants/:id')
    @SetMetadata('roles', ['SUPER_ADMIN'])
    async getTenantDetails(@Param('id') id: string) {
        return this.adminService.getTenantDetails(id);
    }
}
