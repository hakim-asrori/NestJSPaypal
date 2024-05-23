import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppGateway } from "src/service_modules/app.gateway";
import { Xendit } from "src/components/entities/xendit.entity";
import { PaypalController } from "./paypal.controller";
import { PaypalService } from "./paypal.service";
import { PaymentLog } from "src/components/entities/payment-log.entity";
import { CaptureListener } from "src/components/listener/capture.listener";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Xendit,
            PaymentLog
        ])
    ],
    controllers: [PaypalController],
    providers: [
        PaypalService,
        AppGateway,
        CaptureListener
    ]
})

export class PaypalModule {}