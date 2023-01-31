import {IsNumber, IsString} from "class-validator";

export class AddExChangeDTO {

    @IsString()
    amount: string

    @IsString()
    amount_to: string

    @IsString()
    from: string

    @IsString()
    to: string

}