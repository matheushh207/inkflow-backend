import { MercadoPagoConfig, Payment } from 'mercadopago';

// Configuração isolada com as credenciais fornecidas pelo usuário
const client = new MercadoPagoConfig({ 
    accessToken: 'APP_USR-721036256111332-041616-a62ddef0cdd21d0f714fbb34fbfb18ec-584290181' 
});

const payment = new Payment(client);

interface PaymentData {
    email: string;
    userId: string;
    planId: string; // 'solo', 'profissional' ou 'elite'
}

/**
 * Cria um pagamento PIX dinâmico baseado no plano selecionado
 */
export async function criarPagamentoPix({ email, userId, planId }: PaymentData) {
    let amount = 35; // Fallback (deveria ser evitado)
    let description = "Plano Mensal InkFlow";

    // Identificação dinâmica dos valores conforme solicitado
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
        external_reference: userId, // Identificador do usuário para o webhook
        notification_url: `${process.env.WEBHOOK_URL || 'https://inkflow-crm.onrender.com'}/mercadopago/webhook`,
        payer: {
            email: email,
            first_name: 'Cliente',
            last_name: 'InkFlow'
        }
    };

    try {
        const response = await payment.create({ body });
        return {
            payment_id: response.id,
            qr_code: response.point_of_interaction?.transaction_data?.qr_code,
            qr_code_base64: response.point_of_interaction?.transaction_data?.qr_code_base64,
            status: response.status
        };
    } catch (error) {
        console.error('Erro ao criar pagamento Mercado Pago:', error);
        throw error;
    }
}

/**
 * Busca os detalhes de um pagamento pelo ID
 */
export async function buscarPagamento(paymentId: string) {
    try {
        const response = await payment.get({ id: paymentId });
        return response;
    } catch (error) {
        console.error('Erro ao buscar pagamento Mercado Pago:', error);
        throw error;
    }
}
