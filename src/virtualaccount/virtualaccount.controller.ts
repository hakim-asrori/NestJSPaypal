import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req } from "@nestjs/common";
import { AppGateway } from "src/service_modules/app.gateway";
import { VirtualAccountService } from "./virtualaccount.service";
import { CreateVADto } from "src/components/dto/create-va.dto";

@Controller("virtualaccount")
export class VirtualAccountController {

    constructor(
        private virtualService: VirtualAccountService,
        private appGateway: AppGateway
    ) {}

    @Post("create")
    async createVa(@Body() createVa: CreateVADto) : Promise<any> {
        return await this.virtualService.createVirtualAccount(createVa)
    }

    @Post("callback")
    @HttpCode(HttpStatus.OK)
    async callbackQr(@Body() xenditCallbackData: any): Promise<any> {
        try {
            
            const external_id = xenditCallbackData?.external_id;
            
            const updatePayment = await this.virtualService.updatePayment(
                external_id
            )
            
            const message = "Success"
            this.appGateway.sendMessageToClients(message)

            return {
                success: true,
                data: xenditCallbackData
            }

        } catch (error) {

            console.log(error);
            
            throw error
        }
    }

    @Get(":bank_code/:id/get")
    getData(
        @Param("bank_code") bank_code: string,
        @Param("id") id: string
    ) {
        return this.virtualService.getData(bank_code, id)
    }
}