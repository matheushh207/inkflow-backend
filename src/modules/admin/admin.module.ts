import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MailModule } from '../mail/mail.module';

@Module({
    imports: [MailModule],
    providers: [AdminService],
    controllers: [AdminController],
})
export class AdminModule { }
