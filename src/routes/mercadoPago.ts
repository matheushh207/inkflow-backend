import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { criarPagamentoPix, buscarPagamento } from '../services/mercadoPago';
import { PrismaClient } from '@prisma/client';

@Controller('mercadopago')
export class MercadoPagoController {
    private prisma = new PrismaClient();

    @Post('pix')
    async criarPix(@Body() body: any) {
        try {
            const { email, userId, planId } = body;

            if (!email || !userId || !planId) {
                return { error: 'Campos obrigatórios: email, userId, planId' };
            }

            const pagamento = await criarPagamentoPix({ email, userId, planId });
            return pagamento;
        } catch (error) {
            return { error: 'Erro ao gerar pagamento PIX' };
        }
    }

    @Post('webhook')
    async webhook(@Body() body: any, @Res() res: Response) {
        try {
            const { data, type } = body;

            // O Mercado Pago envia notificações de diversos tipos. Focamos no 'payment'.
            if (type === 'payment' && data && data.id) {
                const paymentId = data.id;
                const mpDetails = await buscarPagamento(paymentId);

                // Se o pagamento for aprovado e tiver a referência do usuário
                if (mpDetails.status === 'approved') {
                    const userId = mpDetails.external_reference;
                    if (userId) {
                        await this.ativarPlano(userId);
                    }
                }
            }

            // SEMPRE responder 200 conforme solicitado
            return res.status(HttpStatus.OK).send('OK');
        } catch (error) {
            console.error('Erro no processamento do Webhook:', error);
            // Mesmo em erro, respondemos 200 para evitar retentativas infinitas do MP
            return res.status(HttpStatus.OK).send('OK');
        }
    }

    /**
     * Função isolada para ativar o plano do usuário
     */
    private async ativarPlano(userId: string) {
        console.log('Iniciando ativação automática do plano para o usuário:', userId);
        
        try {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                include: { tenant: true }
            });

            if (!user) {
                console.error('Usuário não encontrado para ativação de plano:', userId);
                return;
            }

            const tenantId = user.tenantId;

            const subscription = await this.prisma.subscription.findFirst({
                where: { tenantId },
                orderBy: { createdAt: 'desc' }
            });

            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);

            if (subscription) {
                await this.prisma.subscription.update({
                    where: { id: subscription.id },
                    data: {
                        status: 'ACTIVE',
                        expiresAt: expiresAt
                    }
                });
                console.log(`Plano ativado com sucesso para o Tenant: ${tenantId}`);
            } else {
                const defaultPlan = await this.prisma.plan.findFirst({
                    where: { 
                        OR: [
                            { name: { contains: 'Solo', mode: 'insensitive' } },
                            { id: 'solo' }
                        ]
                    }
                });

                if (defaultPlan) {
                    await this.prisma.subscription.create({
                        data: {
                            tenantId: tenantId,
                            planId: defaultPlan.id,
                            status: 'ACTIVE',
                            expiresAt: expiresAt
                        }
                    });
                    console.log(`Nova assinatura criada e ativa para o Tenant: ${tenantId}`);
                }
            }
        } catch (error) {
            console.error('Erro ao ativar plano via webhook:', error);
        }
    }
}
