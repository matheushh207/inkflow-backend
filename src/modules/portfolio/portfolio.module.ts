import { Module, forwardRef } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { TenantModule } from '../tenant/tenant.module';
import { BillingModule } from '../billing/billing.module';

@Module({
    imports: [
        PrismaModule,
        forwardRef(() => TenantModule),
        BillingModule
    ],
    controllers: [PortfolioController],
    providers: [PortfolioService],
    exports: [PortfolioService]
})
export class PortfolioModule { }
