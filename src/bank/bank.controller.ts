import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { AppGateway } from "src/service_modules/app.gateway";
import { BankService } from "./bank.services";

@Controller("bank")
export class BankController {

    constructor(
        private bankService: BankService,
        private appGateway: AppGateway
    ) {}

    @Get("list")
    async list() : Promise<any> {
        return await this.bankService.listBank()
    }
}