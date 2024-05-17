import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Xendit } from "./entities/xendit.entity";
import { XenditController } from "./xendit.controller";
import { XenditService } from "./xendit.service";
import { AppGateway } from "src/service_modules/app.gateway";

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