import { Module } from '@nestjs/common';
import { CurrencyController } from './currency.controller';
import { CurrencyService } from './currency.service';
import {MongooseModule} from "@nestjs/mongoose";
import {CurrencySchema} from "./currency.model";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: 'Currency', schema: CurrencySchema }]),
    ],
    controllers: [CurrencyController],
    providers: [CurrencyService],
})
export class CurrencyModule {}
