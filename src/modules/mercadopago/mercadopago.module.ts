import { Module } from '@nestjs/common';
import { MercadoPagoService } from './mercadopago.service';
import { MercadoPagoController } from './mercadopago.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [MercadoPagoService],
    controllers: [MercadoPagoController],
    exports: [MercadoPagoService]
})
export class MercadoPagoModule {}
