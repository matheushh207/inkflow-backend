import { Router, Request, Response } from 'express';
import { criarPagamentoPix, buscarPagamento } from '../services/mercadoPago';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Função isolada para ativar o plano do usuário
 */
async function ativarPlano(userId: string) {
    console.log('Iniciando ativação automática do plano para o usuário:', userId);
    
    try {
        // Busca o usuário para encontrar o tenantId
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { tenant: true }
        });

        if (!user) {
            console.error('Usuário não encontrado para ativação de plano:', userId);
            return;
        }

        const tenantId = user.tenantId;

        // Verifica se já existe uma assinatura para este tenant
        // Se houver, atualizamos. Se não, criamos uma nova vinculada ao plano Solo como default (ou o que estiver no pagamento)
        const subscription = await prisma.subscription.findFirst({
            where: { tenantId },
            orderBy: { createdAt: 'desc' }
        });

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 dias de acesso

        if (subscription) {
            await prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    status: 'ACTIVE',
                    expiresAt: expiresAt
                }
            });
            console.log(`Plano ativado com sucesso para o Tenant: ${tenantId}`);
        } else {
            // Caso não exista assinatura prévia, buscamos o plano 'solo' como fallback
            const defaultPlan = await prisma.plan.findFirst({
                where: { 
                    OR: [
                        { name: { contains: 'Solo', mode: 'insensitive' } },
                        { id: 'solo' }
                    ]
                }
            });

            if (defaultPlan) {
                await prisma.subscription.create({
                    data: {
                        tenantId: tenantId,
                        planId: defaultPlan.id,
                        status: 'ACTIVE',
                        expiresAt: expiresAt
                    }
                });
                console.log(`Nova assinatura criada e ativa para o Tenant: ${tenantId}`);
            } else {
                console.error('Falha ao ativar plano: Nenhum plano base encontrado no banco de dados.');
            }
        }
    } catch (error) {
        console.error('Erro ao ativar plano via webhook:', error);
    }
}

// ROTA: Criar Pagamento PIX
// Body: { email, userId, planId }
router.post('/api/mp/pix', async (req: Request, res: Response) => {
    try {
        const { email, userId, planId } = req.body;

        if (!email || !userId || !planId) {
            return res.status(400).json({ error: 'Campos obrigatórios: email, userId, planId' });
        }

        const pagamento = await criarPagamentoPix({ email, userId, planId });
        return res.json(pagamento);
    } catch (error) {
        return res.status(500).json({ error: 'Erro ao gerar pagamento PIX' });
    }
});

// WEBHOOK: Receber notificação do Mercado Pago
router.post('/api/webhook/mercadopago', async (req: Request, res: Response) => {
    try {
        const { data, type } = req.body;

        // O Mercado Pago envia notificações de diversos tipos. Focamos no 'payment'.
        if (type === 'payment' && data && data.id) {
            const paymentId = data.id;
            const mpDetails = await buscarPagamento(paymentId);

            // Se o pagamento for aprovado e tiver a referência do usuário
            if (mpDetails.status === 'approved') {
                const userId = mpDetails.external_reference;
                if (userId) {
                    await ativarPlano(userId);
                }
            }
        }

        // SEMPRE responder 200 conforme solicitado
        return res.status(200).send('OK');
    } catch (error) {
        console.error('Erro no processamento do Webhook:', error);
        return res.status(200).send('OK'); // Mesmo em erro, respondemos 200 para evitar retentativas infinitas do MP
    }
});

export default router;
