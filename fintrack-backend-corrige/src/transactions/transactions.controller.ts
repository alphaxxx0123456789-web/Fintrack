import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { FilterTransactionDto } from './dto/filter-transaction.dto';
import { TransactionType } from './transaction.entity';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('transactions')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @ApiOperation({ summary: 'Créer une transaction (revenu ou dépense)' })
  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(user.id, dto);
  }

  @ApiOperation({ summary: 'Lister mes transactions (admin : filtrable par userId)' })
  @Get()
  findAll(@CurrentUser() user: any, @Query() filters: FilterTransactionDto) {
    return this.transactionsService.findAll(user, filters);
  }

  @ApiOperation({ summary: 'Statistiques agrégées pour le tableau de bord' })
  @Get('stats/summary')
  getSummary(@CurrentUser() user: any, @Query() filters: FilterTransactionDto) {
    return this.transactionsService.getSummary(user, filters);
  }

  @ApiOperation({ summary: 'Détail d’une transaction' })
  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.transactionsService.findOne(user, id);
  }

  @ApiOperation({ summary: 'Modifier une transaction' })
  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(user, id, dto);
  }

  @ApiOperation({ summary: 'Supprimer toutes mes transactions d’un type (revenu ou dépense)' })
  @Delete('bulk/:type')
  removeAllByType(@CurrentUser() user: any, @Param('type') type: string) {
    if (type !== TransactionType.INCOME && type !== TransactionType.EXPENSE) {
      throw new BadRequestException('Le type doit être "income" ou "expense".');
    }
    return this.transactionsService.removeAllByType(user, type as TransactionType);
  }

  @ApiOperation({ summary: 'Supprimer une transaction' })
  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.transactionsService.remove(user, id);
  }
}
