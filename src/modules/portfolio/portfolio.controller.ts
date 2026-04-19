import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PortfolioService } from './portfolio.service';
import { SubscriptionGuard } from '../billing/subscription.guard';

@Controller('portfolio')
export class PortfolioController {
    constructor(private readonly portfolioService: PortfolioService) {}

    // Public endpoint for the reservation page
    @Get('public/:slug')
    async getPublic(@Param('slug') slug: string) {
        return this.portfolioService.findPublicBySlug(slug);
    }

    // Authenticated endpoints for the dashboard
    @Get()
    @UseGuards(AuthGuard('jwt'), SubscriptionGuard)
    async findAll() {
        return this.portfolioService.findAll();
    }

    @Post()
    @UseGuards(AuthGuard('jwt'), SubscriptionGuard)
    async create(@Body() data: any) {
        return this.portfolioService.create(data);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'), SubscriptionGuard)
    async update(@Param('id') id: string, @Body() data: any) {
        return this.portfolioService.update(id, data);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), SubscriptionGuard)
    async delete(@Param('id') id: string) {
        return this.portfolioService.delete(id);
    }

    @Post(':id/view')
    async incrementViews(@Param('id') id: string) {
        return this.portfolioService.incrementViews(id);
    }

    @Post(':id/like')
    async toggleLike(@Param('id') id: string) {
        return this.portfolioService.toggleLike(id);
    }
}
