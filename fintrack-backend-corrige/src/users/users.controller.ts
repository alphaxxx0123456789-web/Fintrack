import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(RolesGuard) // JwtAuthGuard est déjà appliqué globalement (voir app.module)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // --- Self-service (n'importe quel utilisateur connecté) ---
  // IMPORTANT : ces routes "me" doivent rester déclarées avant les routes
  // admin ':id' ci-dessous, sinon Nest matcherait "me" comme un :id.

  @ApiOperation({ summary: "Récupérer mon propre profil" })
  @Get('me')
  getMe(@CurrentUser() user: { id: string }) {
    return this.usersService.findOne(user.id);
  }

  @ApiOperation({ summary: "Mettre à jour mon propre profil" })
  @Patch('me')
  updateMe(@CurrentUser() user: { id: string }, @Body() dto: UpdateUserDto) {
    return this.usersService.update(user.id, dto);
  }

  @ApiOperation({ summary: 'Changer mon mot de passe' })
  @Patch('me/password')
  async changeMyPassword(@CurrentUser() user: { id: string }, @Body() dto: ChangePasswordDto) {
    await this.usersService.changePassword(user.id, dto);
    return { message: 'Mot de passe mis à jour.' };
  }

  @ApiOperation({ summary: 'Supprimer mon propre compte' })
  @Delete('me')
  @HttpCode(204)
  removeMe(@CurrentUser() user: { id: string }) {
    return this.usersService.remove(user.id);
  }

  // --- Administration (RBAC : rôle admin uniquement) ---

  @ApiOperation({ summary: 'Lister tous les utilisateurs (admin)' })
  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Récupérer un utilisateur par id (admin)' })
  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: "Changer le rôle d'un utilisateur (admin)" })
  @Roles(Role.ADMIN)
  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.usersService.updateRole(id, dto.role);
  }

  @ApiOperation({ summary: 'Supprimer un utilisateur (admin)' })
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
