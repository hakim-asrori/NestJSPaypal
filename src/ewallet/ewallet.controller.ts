import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { AppGateway } from "src/service_modules/app.gateway";
import { EwalletService } from "./ewallet.service";

@Controller("ewallet")
export class EwalletController {

    constructor(
        private ewalletService: EwalletService,
        private appGateway: AppGateway
    ) {}

    @Get("list")
    async list() : Promise<any> {
        return await this.ewalletService.listEwallet()
    }

    @Post("create")
    async qrXendit() : Promise<any> {
        return await this.ewalletService.createEwallet()
    }

    @Post("callback")
    @HttpCode(HttpStatus.OK)
    async callbackQr(@Body() ewalletCallbackData: any): Promise<any> {
        try {
            
            const external_id = ewalletCallbackData?.data?.reference_id
            const status = ewalletCallbackData?.data?.status
            
            const updatePayment = await this.ewalletService.updatePayment(
                external_id,
                status
            )

            return {
                success: true,
                data: ewalletCallbackData
            }

        } catch (error) {
            console.log(error);
            
            throw error
        }
    }
}