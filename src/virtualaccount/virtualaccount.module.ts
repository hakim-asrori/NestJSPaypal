import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppGateway } from "src/service_modules/app.gateway";
import { VirtualAccountController } from "./virtualaccount.controller";
import { VirtualAccountService } from "./virtualaccount.service";
import { Xendit } from "src/components/entities/xendit.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Xendit])
    ],
    controllers: [VirtualAccountController],
    providers: [
        VirtualAccountService,
        AppGateway
    ]
})

export class VirtualAccountModule {}