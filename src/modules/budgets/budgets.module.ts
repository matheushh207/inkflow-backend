import { Module } from '@nestjs/common';
import { BudgetController } from './budgets.controller';

@Module({
    controllers: [BudgetController],
})
export class BudgetsModule { }