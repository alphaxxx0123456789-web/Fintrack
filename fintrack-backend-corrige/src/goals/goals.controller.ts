import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('goals')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @ApiOperation({ summary: "Créer un objectif d'épargne" })
  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateGoalDto) {
    return this.goalsService.create(user.id, dto);
  }

  @ApiOperation({ summary: 'Lister mes objectifs (admin : tous)' })
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.goalsService.findAll(user);
  }

  @ApiOperation({ summary: "Détail d'un objectif" })
  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.goalsService.findOne(user, id);
  }

  @ApiOperation({ summary: 'Modifier un objectif (ex : mettre à jour le montant économisé)' })
  @Patch(':id')
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateGoalDto) {
    return this.goalsService.update(user, id, dto);
  }

  @ApiOperation({ summary: 'Supprimer tous mes objectifs' })
  @Delete()
  removeAll(@CurrentUser() user: any) {
    return this.goalsService.removeAll(user);
  }

  @ApiOperation({ summary: 'Supprimer un objectif' })
  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.goalsService.remove(user, id);
  }
}
