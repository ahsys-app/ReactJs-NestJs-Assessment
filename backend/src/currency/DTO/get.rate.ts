import {IsOptional, IsString} from 'class-validator';

export class GetRateDTO {

    @IsString()
    amount: string;

    @IsString()
    from: string;

    @IsString()
    to: string;

}