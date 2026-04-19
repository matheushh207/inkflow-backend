import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@Request() req) {
    // Each user only sees notifications for their studio (tenantId)
    const tenantId = req.user.tenantId;
    return this.notificationsService.findAll(tenantId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Request() req) {
    const tenantId = req.user.tenantId;
    return this.notificationsService.markAsRead(id, tenantId);
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.notificationsService.markAllAsRead(tenantId);
  }
}
