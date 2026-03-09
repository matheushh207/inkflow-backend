import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { MailModule } from './modules/mail/mail.module';
import { ConfirmationController } from './modules/mail/confirmation.controller';
import { TenantController } from './modules/mail/tenant.controller';
import { AppointmentController } from './modules/appointments/appointments.controller';
import { BudgetController } from './modules/budgets/budgets.controller';

@Module({
    imports: [PrismaModule, MailModule],
    controllers: [AppController, ConfirmationController, TenantController, AppointmentController, BudgetController],
    providers: [],
})
export class AppModule { }




