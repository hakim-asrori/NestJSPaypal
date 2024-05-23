import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { AppGateway } from "src/service_modules/app.gateway";
import { VirtualAccountService } from "./virtualaccount.service";

@Controller("virtualaccount")
export class VirtualAccountController {

    constructor(
        private virtualService: VirtualAccountService,
        private appGateway: AppGateway
    ) {}

    @Post("create")
    async qrXendit() : Promise<any> {
        return await this.virtualService.createVirtualAccount()
    }

    @Post("callback")
    @HttpCode(HttpStatus.OK)
    async callbackQr(@Body() xenditCallbackData: any): Promise<any> {
        try {
            
            const external_id = xenditCallbackData?.external_id;
            
            const updatePayment = await this.virtualService.updatePayment(
                external_id
            )
            
            const message = "Hello Rahani"
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