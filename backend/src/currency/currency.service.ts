import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import axios from "axios";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {AddExChangeDTO} from "./DTO/add.exchange";
import {Currency} from "./currency.model";
import {ExchangeTypes} from "../Enums/exchange.types";
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import Keys from "../utils/keys";
import {FilterExchangeDTO} from "./DTO/filter.exchange";

@WebSocketGateway()
@Injectable()
export class CurrencyService implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server;

    constructor(
        @InjectModel('Currency') private readonly currencyModel: Model<Currency>,
    ) {}

    async getAll() {
        return {
            currency: ['USD', 'EUR', 'GBP'],
            crypto: ['BTC', 'ETH', 'XRP', 'LTC'],
        };
    }

    async getExchangeHistory(filterExchangeDTO: FilterExchangeDTO): Promise<Currency[]> {
        try{
            let search = {}
            if( Object.keys(ExchangeTypes).includes(filterExchangeDTO.type.toUpperCase()) ){
                search['type'] = filterExchangeDTO.type;
            }

            Logger.debug(filterExchangeDTO);

            if( filterExchangeDTO.from !== null && filterExchangeDTO.from !== '' ){
                search['createdAt'] = {
                    $gte: filterExchangeDTO.from
                };
            }
            if( filterExchangeDTO.to !== null && filterExchangeDTO.to !== '' ){
                search['createdAt'] = { ...search['createdAt'],
                    $lt: filterExchangeDTO.to
                };
            }
            Logger.log(search)
            return await this.currencyModel.find(search).sort({createdAt: -1});
        }catch (e) {
            Logger.error(e);
            return [];
        }
    }

    async getExchangeRates(from: string, to: string,) {
        const options = {
            method: 'GET',
            headers: { 'x-rapidapi-key': process.env.RAPIDAPI_KEY },
            url: process.env.RAPID_API_EXCHANGE,
            params: { from, to }
        };
        try {
            const response = await axios(options);
            return response.data;
        } catch (e) {
            Logger.error(e);
            throw new BadRequestException('Could not get exchange rate, try again!');
        }
    }

    async getCryptoExchangeRates(from: string) {
        const options = {
            method: 'GET',
            headers: { 'X-CMC_PRO_API_KEY': process.env.COINMARKETCAP_API_KEY },
            url: process.env.COINMARKETCAP_API_CRYPTO,
            params: { symbol: from }
        };
        try {
            const response = await axios(options);
            const obj: any = Object.values(response.data.data)[0];
            if( obj.quote.USD.price !== null ){
                let insertedData: AddExChangeDTO = new AddExChangeDTO();
                insertedData.from = from;
                insertedData.to = 'USD';
                insertedData.amount = '1';
                insertedData.amount_to = `${parseFloat(insertedData.amount) * obj.quote.USD.price}`;
                const row = new this.currencyModel(insertedData);
                row.type = ExchangeTypes.LIVE;
                await row.save();
                await this.server.emit(Keys.sendData, row);
            }
            return { message: "All live data saved to DB!" };
        } catch (error) {
            Logger.log(error);
            throw new BadRequestException('Live price not working now!');
        }
    }
    
    async addExchange(addExchangeDTO: AddExChangeDTO, type: string){
        try{
            const newExchange = new this.currencyModel(addExchangeDTO);
            newExchange.type = type;
            return await newExchange.save();
        } catch (e) {
            Logger.log(e.detail);
            throw new BadRequestException('Could not add your exchange!');
        }
    }

    /**
     * Socket
     */

    async afterInit(server: any) {
        server.on('connection', socket => {
            socket.emit('connection', 'Welcome to the socket!');
        });
    }

    handleConnection(client: any, ...args: any[]): any {
        console.log('client connected');
    }

    handleDisconnect(client: any): any {
        console.log('client disconnected');
    }
}
