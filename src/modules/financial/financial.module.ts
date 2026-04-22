import { Module } from '@nestjs/common';
import { FinancialController } from './financial.controller';
import { TenantModule } from '../tenant/tenant.module';

@Module({
    imports: [TenantModule],
    controllers: [FinancialController],
})
export class FinancialModule { }
