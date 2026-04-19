import { Module } from '@nestjs/common';
import { BudgetController, PublicBudgetController } from './budgets.controller';
import { MailModule } from '../mail/mail.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [MailModule, NotificationsModule],
    controllers: [BudgetController, PublicBudgetController],
})
export class BudgetsModule { }