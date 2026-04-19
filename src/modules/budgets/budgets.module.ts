import { Module } from '@nestjs/common';
import { BudgetController, PublicBudgetController } from './budgets.controller';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [MailModule],
    controllers: [BudgetController, PublicBudgetController],
})
export class BudgetsModule { }