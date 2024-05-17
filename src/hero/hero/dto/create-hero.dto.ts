import { IsAlpha, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateHeroDto {
    @IsNumber()
    id: number;

    @IsNotEmpty()
    @IsAlpha()
    nama: string;

    @IsString()
    type: string;
}