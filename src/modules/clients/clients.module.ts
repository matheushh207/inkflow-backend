import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientController } from './clients.controller';
import { TenantModule } from '../tenant/tenant.module';

@Module({
    imports: [TenantModule],
    controllers: [ClientController],
    providers: [ClientsService],
    exports: [ClientsService],
})
export class ClientsModule { }
