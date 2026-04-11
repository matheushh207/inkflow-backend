import { Module, Global, forwardRef } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Global()
@Module({
    imports: [forwardRef(() => PrismaModule)],
    controllers: [TenantController],
    providers: [TenantService],
    exports: [TenantService],
})
export class TenantModule { }
