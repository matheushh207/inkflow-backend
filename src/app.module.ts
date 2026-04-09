import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { BillingModule } from './modules/billing/billing.module';
import { ClientsModule } from './modules/clients/clients.module';
import { AdminModule } from './modules/admin/admin.module';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { TenantInterceptor } from './modules/tenant/tenant.interceptor';
import { RolesGuard } from './modules/auth/roles.guard';
import { SubscriptionGuard } from './modules/billing/subscription.guard';

@Module({
    imports: [
        PrismaModule, 
        MailModule, 
        AuthModule, 
        TenantModule,
        BillingModule,
        ClientsModule,
        AdminModule
    ],
    controllers: [
        AppController,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: TenantInterceptor,
        },
    ],
})
export class AppModule { }
