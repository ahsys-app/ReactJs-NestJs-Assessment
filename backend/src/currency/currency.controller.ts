import {Controller, Logger, Get, Post, Body, Param, Query} from '@nestjs/common';
import {CurrencyService} from './currency.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import {GetRateDTO} from "./DTO/get.rate";
import {AddExChangeDTO} from "./DTO/add.exchange";
import {ExchangeTypes} from "../Enums/exchange.types";
import {FilterExchangeDTO} from "./DTO/filter.exchange";

@Controller('currency')
export class CurrencyController {

    constructor(private readonly currencyService: CurrencyService) {}

    @Get()
    async getAll() {
        return await this.currencyService.getAll();
    }

    @Get('getExchangeHistory/:type?/:from?/:to?')
    async getExchangeHistory(@Query() query: FilterExchangeDTO) {
        return await this.currencyService.getExchangeHistory(query);
    }

    @Post('getExchangeRates')
    async getExchangeRates(@Body() getRateDTO: GetRateDTO) {
        try{
            const rate = await this.currencyService.getExchangeRates(getRateDTO.from, getRateDTO.to);
            return (parseFloat(getRateDTO.amount) * rate).toFixed(parseInt(process.env.ROUNDED_NUMBER));
        }catch (e) {
            return 0.00;
        }
    }

    @Post('addExchangeByUser')
    async addExchangeByUser(@Body() addExChangeDTO: AddExChangeDTO) {
        return this.currencyService.addExchange(addExChangeDTO, ExchangeTypes.EXCHANGED);
    }

    private async exchangeRatesByCronJob() {
        const all = await this.currencyService.getAll();
        await Promise.all(all.crypto.map(async (value, index) => {
            return await this.currencyService.getCryptoExchangeRates(value);
        }));
    }

    @Cron(CronExpression.EVERY_30_SECONDS)
    async cronFunction() {
        //await this.exchangeRatesByCronJob();
    }

}
