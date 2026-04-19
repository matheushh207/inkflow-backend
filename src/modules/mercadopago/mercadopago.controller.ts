import { Controller, Post, Body, Res, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { Response } from 'express';
import { MercadoPagoService } from './mercadopago.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('mercadopago')
export class MercadoPagoController {
    constructor(private readonly mercadoPagoService: MercadoPagoService) {}

    @UseGuards(AuthGuard('jwt'))
    @Post('pix')
    async criarPix(@Body() body: any, @Req() req: any) {
        try {
            const { planId } = body;
            const userId = req.user.userId;
            const email = req.user.email;

            if (!planId) {
                return { error: 'Campo obrigatório: planId' };
            }

            return await this.mercadoPagoService.criarPagamentoPix(email, userId, planId);
        } catch (error) {
            return { error: 'Erro ao gerar pagamento PIX' };
        }
    }

    @Post('webhook')
    async webhook(@Body() body: any, @Res() res: Response) {
        try {
            const { data, type } = body;

            if (type === 'payment' && data && data.id) {
                const paymentId = data.id;
                const mpDetails = await this.mercadoPagoService.buscarPagamento(paymentId);

                if (mpDetails.status === 'approved') {
                    const userId = mpDetails.external_reference;
                    if (userId) {
                        await this.mercadoPagoService.ativarPlano(userId);
                    }
                }
            }

            return res.status(HttpStatus.OK).send('OK');
        } catch (error) {
            console.error('Erro no processamento do Webhook:', error);
            return res.status(HttpStatus.OK).send('OK');
        }
    }
}
