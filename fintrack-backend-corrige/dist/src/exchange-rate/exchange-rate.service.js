"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeRateService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ExchangeRateService = class ExchangeRateService {
    constructor(configService) {
        this.configService = configService;
        this.baseUrl =
            this.configService.get('EXCHANGE_RATE_API_URL') ||
                'https://open.er-api.com/v6/latest';
    }
    async getRates(base) {
        const currency = base.toUpperCase();
        let response;
        try {
            response = await fetch(`${this.baseUrl}/${currency}`);
        }
        catch (err) {
            throw new common_1.BadGatewayException("Impossible de contacter le service externe de taux de change.");
        }
        if (!response.ok) {
            throw new common_1.BadRequestException(`Devise "${currency}" invalide ou non supportée.`);
        }
        const data = (await response.json());
        if (data.result !== 'success') {
            throw new common_1.BadGatewayException('Réponse invalide du service de taux de change.');
        }
        return data;
    }
    async convert(amount, from, to) {
        const data = await this.getRates(from);
        const targetCurrency = to.toUpperCase();
        const rate = data.rates[targetCurrency];
        if (!rate) {
            throw new common_1.BadRequestException(`Devise cible "${targetCurrency}" invalide.`);
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
};
exports.ExchangeRateService = ExchangeRateService;
exports.ExchangeRateService = ExchangeRateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], ExchangeRateService);
//# sourceMappingURL=exchange-rate.service.js.map