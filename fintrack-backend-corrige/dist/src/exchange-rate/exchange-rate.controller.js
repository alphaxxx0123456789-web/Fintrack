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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExchangeRateController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const exchange_rate_service_1 = require("./exchange-rate.service");
const convert_dto_1 = require("./dto/convert.dto");
const CURRENCY_CODE_RE = /^[A-Za-z]{3}$/;
let ExchangeRateController = class ExchangeRateController {
    constructor(exchangeRateService) {
        this.exchangeRateService = exchangeRateService;
    }
    getRates(base) {
        if (!CURRENCY_CODE_RE.test(base)) {
            throw new common_1.BadRequestException('Le code devise doit contenir exactement 3 lettres (ISO 4217).');
        }
        return this.exchangeRateService.getRates(base);
    }
    convert(query) {
        return this.exchangeRateService.convert(query.amount, query.from, query.to);
    }
};
exports.ExchangeRateController = ExchangeRateController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: "Taux de change pour une devise de base (ex: XOF, EUR, USD)" }),
    (0, common_1.Get)(':base'),
    __param(0, (0, common_1.Param)('base')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ExchangeRateController.prototype, "getRates", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Convertir un montant entre deux devises' }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [convert_dto_1.ConvertDto]),
    __metadata("design:returntype", void 0)
], ExchangeRateController.prototype, "convert", null);
exports.ExchangeRateController = ExchangeRateController = __decorate([
    (0, swagger_1.ApiTags)('exchange-rate'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('exchange-rate'),
    __metadata("design:paramtypes", [exchange_rate_service_1.ExchangeRateService])
], ExchangeRateController);
//# sourceMappingURL=exchange-rate.controller.js.map