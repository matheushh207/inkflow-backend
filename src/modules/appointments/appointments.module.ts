import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentController } from './appointments.controller';

@Module({
    providers: [AppointmentsService],
    controllers: [AppointmentController],
})
export class AppointmentsModule { }