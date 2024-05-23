import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppGateway } from "src/service_modules/app.gateway";
import { EwalletController } from "./ewallet.controller";
import { EwalletService } from "./ewallet.service";
import { Ewallet } from "./entities/ewallet.entity";
import { Xendit } from "src/components/entities/xendit.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Ewallet]),
        TypeOrmModule.forFeature([Xendit])
    ],
    controllers: [EwalletController],
    providers: [
        EwalletService,
        AppGateway
    ]
})

export class EwalletModule {}