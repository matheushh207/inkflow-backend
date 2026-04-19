import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    title: string;
    message: string;
    type?: NotificationType;
    tenantId: string;
  }) {
    return this.prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type || NotificationType.INFO,
        tenantId: data.tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.notification.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async markAsRead(id: string, tenantId: string) {
    return this.prisma.notification.updateMany({
      where: { id, tenantId },
      data: { read: true },
    });
  }

  async markAllAsRead(tenantId: string) {
    return this.prisma.notification.updateMany({
      where: { tenantId, read: false },
      data: { read: true },
    });
  }

  // Trigger for Low Stock
  async checkStockAndNotify(inventoryId: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id: inventoryId },
    });

    if (item && item.stock <= item.minStock) {
      await this.create({
        title: 'Estoque Baixo!',
        message: `O item ${item.name} atingiu a quantidade mínima (${item.stock} ${item.unit}).`,
        type: NotificationType.WARNING,
        tenantId: item.tenantId,
      });
    }
  }

  // Trigger for Budget without return (2 days)
  // This could be called by a cron job or on budget list fetch
  async notifyOldBudgets() {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const oldBudgets = await this.prisma.budget.findMany({
      where: {
        status: 'NEW',
        createdAt: { lte: twoDaysAgo },
        // Simple strategy: check if we already notified about this today or similar
        // For now, let's just find them.
      },
    });

    for (const budget of oldBudgets) {
      // Check if a notification already exists for this budget in the last 24h
      // (Optional simple check to avoid spam)
      
      await this.create({
        title: 'Orçamento Sem Retorno',
        message: `O orçamento "${budget.title}" para ${budget.clientName} está sem resposta há mais de 2 dias.`,
        type: NotificationType.WARNING,
        tenantId: budget.tenantId,
      });
    }
  }
}
