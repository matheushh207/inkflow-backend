import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BillingService } from './billing.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('billing')
export class BillingController {
    constructor(private readonly billingService: BillingService) { }

    @Get('plans')
    async getPlans() {
        return this.billingService.getPlans();
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('subscribe')
    async subscribe(@Body() body: any) {
        return this.billingService.createSubscription(
            body.planId, 
            body.paymentMethod, 
            body.cardToken
        );
    }

    @Post('webhook')
    async webhook(@Body() body: any) {
        return this.billingService.handleWebhook(body);
    }
}
