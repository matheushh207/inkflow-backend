import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { BillingModule } from './modules/billing/billing.module';
import { ClientsModule } from './modules/clients/clients.module';
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
        ClientsModule
    ],
    controllers: [
        AppController,
    ],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: TenantInterceptor,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
        {
            provide: APP_GUARD,
            useClass: SubscriptionGuard,
        },
    ],
})
export class AppModule { }
