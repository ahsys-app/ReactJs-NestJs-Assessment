import {IsOptional, IsString} from 'class-validator';

export class FilterExchangeDTO {

    @IsOptional()
    @IsString()
    type: string;

    @IsOptional()
    @IsString()
    from: string;

    @IsOptional()
    @IsString()
    to:string;

}