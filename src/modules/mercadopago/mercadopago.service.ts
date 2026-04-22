import { Injectable } from '@nestjs/common';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MercadoPagoService {
    private client: MercadoPagoConfig;
    private payment: Payment;

    constructor(private prisma: PrismaService) {
        // Configuração com as credenciais fornecidas
        this.client = new MercadoPagoConfig({ 
            accessToken: 'APP_USR-721036256111332-041616-a62ddef0cdd21d0f714fbb34fbfb18ec-584290181' 
        });
        this.payment = new Payment(this.client);
    }

    async criarPagamentoPix(email: string, userId: string, planId: string) {
        let amount = 50.00;
        let description = "Plano Mensal InkFlow";

        const lowerPlanId = planId.toLowerCase();
        if (lowerPlanId === 'solo') {
            amount = 50.00;
            description = "Plano Solo InkFlow";
        } else if (lowerPlanId === 'profissional' || lowerPlanId === 'professional') {
            amount = 80.00;
            description = "Plano Profissional InkFlow";
        } else if (lowerPlanId === 'elite') {
            amount = 120.00;
            description = "Plano Elite InkFlow";
        }

        const body = {
            transaction_amount: amount,
            description: description,
            payment_method_id: 'pix',
            external_reference: userId,
            notification_url: `${process.env.WEBHOOK_URL || 'https://inkflow-backend-73a5.onrender.com'}/mercadopago/webhook`,
            payer: {
                email: email,
                first_name: 'Cliente',
                last_name: 'InkFlow'
            }
        };

        try {
            const response = await this.payment.create({ body });
            return {
                paymentId: response.id,
                qrCode: response.point_of_interaction?.transaction_data?.qr_code,
                qrCodeBase64: response.point_of_interaction?.transaction_data?.qr_code_base64,
                status: response.status
            };
        } catch (error) {
            console.error('Erro Mercado Pago Service:', error);
            throw error;
        }
    }

    async buscarPagamento(paymentId: string) {
        return this.payment.get({ id: paymentId });
    }

    async ativarPlano(userId: string) {
        console.log('[MP] Ativando plano para usuário:', userId);
        
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { tenant: true }
        });

        if (!user) {
            console.error('[MP] Usuário não encontrado:', userId);
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
            console.log(`[MP] Assinatura atualizada: ${tenantId}`);
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
                console.log(`[MP] Nova assinatura criada: ${tenantId}`);
            }
        }
    }
}
