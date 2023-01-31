import * as mongoose from 'mongoose';
import {ExchangeTypes} from "../Enums/exchange.types";

export const CurrencySchema = new mongoose.Schema({
    from: { type: String, required: true },
    to: { type: String, required: true },
    amount: { type: Number, required: true },
    amount_to: { type: Number, required: true },
    type: {
        type: String,
        enum: Object.values(ExchangeTypes),
        default: ExchangeTypes.LIVE
    },

}, {
    timestamps: true,
    collection: 'exchange',
});

export interface Currency extends mongoose.Document {
    id: number;
    amount: number;
    from: string;
    to: string;
    type: string;
}