import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { MailModule } from './modules/mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { TenantMiddleware } from './modules/tenant/tenant.middleware';
import { BillingModule } from './modules/billing/billing.module';
import { ClientsModule } from './modules/clients/clients.module';
import { AdminModule } from './modules/admin/admin.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
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
        AdminModule,
        AppointmentsModule,
        BudgetsModule
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
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(TenantMiddleware)
            .forRoutes('*');
    }
}
