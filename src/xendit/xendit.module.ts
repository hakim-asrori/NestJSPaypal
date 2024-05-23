import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { XenditController } from "./xendit.controller";
import { XenditService } from "./xendit.service";
import { AppGateway } from "src/service_modules/app.gateway";
import { Xendit } from "src/components/entities/xendit.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Xendit])
    ],
    controllers: [XenditController],
    providers: [
        XenditService,
        AppGateway
    ]
})

export class XenditModule {}