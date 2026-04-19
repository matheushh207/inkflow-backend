import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post('invite')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(UserRole.ADMIN)
  async createInvitation(@Body() data: any, @Request() req) {
    const tenantId = req.user.tenantId;
    return this.invitationsService.createInvitation({
      email: data.email,
      role: data.role,
      tenantId,
    });
  }

  @Post('accept')
  async acceptInvitation(@Body() data: any) {
    // This endpoint is public as the user doesn't have an account yet
    // data: token, password, name
    // We should hash the password here or in the service
    return this.invitationsService.acceptInvitation(data.token, data.password, data.name);
  }
}
