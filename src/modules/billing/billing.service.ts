import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantService } from '../tenant/tenant.service';
import { MercadoPagoConfig, Payment } from 'mercadopago';

@Injectable()
export class BillingService implements OnModuleInit {
    private mpClient: MercadoPagoConfig;

    constructor(
        private prisma: PrismaService,
        private tenantService: TenantService
    ) { }

    onModuleInit() {
        const accessToken = process.env.MP_ACCESS_TOKEN;
        if (accessToken) {
            this.mpClient = new MercadoPagoConfig({ accessToken });
        }
    }

    async getPlans() {
        return this.prisma.plan.findMany({
            orderBy: { price: 'asc' }
        });
    }

    async getSubscriptionStatus(tenantId: string) {
        return this.prisma.subscription.findFirst({
            where: { tenantId },
            include: { plan: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async createSubscription(planId: string, paymentMethod: 'PIX' | 'CREDIT_CARD', cardToken?: string) {
        const tenantId = this.tenantService.getTenantId();
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        const plan = await this.prisma.plan.findUnique({ where: { id: planId } });

        if (!plan || !tenant) throw new Error('Plan or Tenant not found');

        const subscription = await this.prisma.subscription.create({
            data: {
                tenantId,
                planId,
                status: 'PENDING'
            }
        });

        const paymentApi = new Payment(this.mpClient);
        
        const paymentData: any = {
            body: {
                transaction_amount: Number(plan.price),
                description: `Assinatura InkFlow - Plano ${plan.name}`,
                payment_method_id: paymentMethod === 'PIX' ? 'pix' : 'visa',
                payer: {
                    email: tenant.users?.[0]?.email || 'financeiro@inkflow.com',
                    first_name: tenant.name.split(' ')[0], // Adicionando primeiro nome obrigatrio
                },
                installments: 1,
                notification_url: process.env.WEBHOOK_URL ? `${process.env.WEBHOOK_URL}/billing/webhook` : undefined,
            }
        };

        if (paymentMethod === 'CREDIT_CARD' && cardToken) {
            paymentData.body.token = cardToken;
        }

        try {
            console.log('Iniciando criao de pagamento no Mercado Pago...');
            const mpResponse = await paymentApi.create(paymentData);
            
            // Log para debug em produo se necessrio
            if (!mpResponse.point_of_interaction?.transaction_data?.qr_code_base64) {
                console.warn('Alerta: QR Code no retornado pelo Mercado Pago. Verifique as credenciais e mtodos ativos.');
            }

            return await this.prisma.payment.create({
                data: {
                    amount: plan.price,
                    status: 'PENDING',
                    method: paymentMethod,
                    externalId: String(mpResponse.id),
                    subscriptionId: subscription.id,
                    paymentUrl: mpResponse.point_of_interaction?.transaction_data?.ticket_url || '',
                    qrCode: mpResponse.point_of_interaction?.transaction_data?.qr_code || '',
                    qrCodeBase64: mpResponse.point_of_interaction?.transaction_data?.qr_code_base64 || '',
                }
            });
        } catch (error) {
            console.error('Erro detalhado Mercado Pago:', error.message, error.stack);
            throw new Error('Falha ao gerar pagamento no Mercado Pago. Verifique se o PIX est configurado na conta.');
        }
    }

    async handleWebhook(body: any) {
        // O Mercado Pago envia o ID do recurso
        if (body.type === 'payment') {
            const paymentId = body.data.id;
            const paymentApi = new Payment(this.mpClient);
            const mpPayment = await paymentApi.get({ id: paymentId });

            if (mpPayment.status === 'approved') {
                const internalPayment = await this.prisma.payment.findUnique({
                    where: { externalId: String(paymentId) },
                    include: { subscription: true }
                });

                if (internalPayment) {
                    await this.prisma.payment.update({
                        where: { id: internalPayment.id },
                        data: { status: 'PAID' }
                    });

                    await this.prisma.subscription.update({
                        where: { id: internalPayment.subscriptionId },
                        data: { 
                            status: 'ACTIVE',
                            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        }
                    });
                }
            }
        }
    }
}
