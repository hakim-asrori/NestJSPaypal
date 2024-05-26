import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { XenditController } from "./xendit.controller";
import { XenditService } from "./xendit.service";
import { AppGateway } from "src/service_modules/app.gateway";
import { Xendit } from "src/components/entities/xendit.entity";
import { PaymentLog } from "src/components/entities/payment-log.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Xendit]),
        TypeOrmModule.forFeature([PaymentLog])
    ],
    controllers: [XenditController],
    providers: [
        XenditService,
        AppGateway
    ]
})

export class XenditModule {}