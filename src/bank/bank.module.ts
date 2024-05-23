import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppGateway } from "src/service_modules/app.gateway";
import { Xendit } from "src/components/entities/xendit.entity";
import { BankController } from "./bank.controller";
import { BankService } from "./bank.services";

@Module({
    imports: [
        TypeOrmModule.forFeature([Xendit])
    ],
    controllers: [BankController],
    providers: [
        BankService,
        AppGateway
    ]
})

export class BankModule {}