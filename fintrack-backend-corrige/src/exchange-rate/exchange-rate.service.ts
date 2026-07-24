import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ExternalRateResponse {
  result: string;
  base_code: string;
  rates: Record<string, number>;
  time_last_update_utc: string;
}

@Injectable()
export class ExchangeRateService {
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl =
      this.configService.get<string>('EXCHANGE_RATE_API_URL') ||
      'https://open.er-api.com/v6/latest';
  }

  /**
   * Récupère tous les taux de change pour une devise de base (ex: XOF, USD, EUR).
   */
  async getRates(base: string): Promise<ExternalRateResponse> {
    const currency = base.toUpperCase();
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/${currency}`);
    } catch (err) {
      throw new BadGatewayException(
        "Impossible de contacter le service externe de taux de change.",
      );
    }

    if (!response.ok) {
      throw new BadRequestException(`Devise "${currency}" invalide ou non supportée.`);
    }

    const data = (await response.json()) as ExternalRateResponse;
    if (data.result !== 'success') {
      throw new BadGatewayException('Réponse invalide du service de taux de change.');
    }
    return data;
  }

  /**
   * Convertit un montant d'une devise vers une autre.
   */
  async convert(amount: number, from: string, to: string) {
    const data = await this.getRates(from);
    const targetCurrency = to.toUpperCase();
    const rate = data.rates[targetCurrency];

    if (!rate) {
      throw new BadRequestException(`Devise cible "${targetCurrency}" invalide.`);
    }

    return {
      amount,
      from: data.base_code,
      to: targetCurrency,
      rate,
      convertedAmount: Math.round(amount * rate * 100) / 100,
      lastUpdate: data.time_last_update_utc,
    };
  }
}
