import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ExchangeRateService } from './exchange-rate.service';
import { ConvertDto } from './dto/convert.dto';

const CURRENCY_CODE_RE = /^[A-Za-z]{3}$/;

@ApiTags('exchange-rate')
@ApiBearerAuth()
@Controller('exchange-rate')
export class ExchangeRateController {
  constructor(private readonly exchangeRateService: ExchangeRateService) {}

  @ApiOperation({ summary: "Taux de change pour une devise de base (ex: XOF, EUR, USD)" })
  @Get(':base')
  getRates(@Param('base') base: string) {
    if (!CURRENCY_CODE_RE.test(base)) {
      throw new BadRequestException('Le code devise doit contenir exactement 3 lettres (ISO 4217).');
    }
    return this.exchangeRateService.getRates(base);
  }

  @ApiOperation({ summary: 'Convertir un montant entre deux devises' })
  @Get()
  convert(@Query() query: ConvertDto) {
    return this.exchangeRateService.convert(query.amount, query.from, query.to);
  }
}
