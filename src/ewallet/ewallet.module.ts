import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppGateway } from "src/service_modules/app.gateway";
import { EwalletController } from "./ewallet.controller";
import { EwalletService } from "./ewallet.service";
import { Ewallet } from "./entities/ewallet.entity";
import { Xendit } from "src/components/entities/xendit.entity";
import { PaymentLog } from "src/components/entities/payment-log.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Ewallet]),
        TypeOrmModule.forFeature([Xendit]),
        TypeOrmModule.forFeature([PaymentLog])
    ],
    controllers: [EwalletController],
    providers: [
        EwalletService,
        AppGateway
    ]
})

export class EwalletModule {}