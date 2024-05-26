import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { XenditService } from "./xendit.service";
import { AppGateway } from "src/service_modules/app.gateway";
import { CreateXenditDto } from "src/components/dto/create-qr.dto";

@Controller("xendit")
export class XenditController {

    constructor(
        private xenditService: XenditService,
        private appGateway: AppGateway
    ) {}

    @Post("qr-xendit")
    async qrXendit(@Body() createQR: CreateXenditDto) : Promise<any> {
        return await this.xenditService.createQrXendit(createQR)
    }

    @Post("qr-callback")
    @HttpCode(HttpStatus.OK)
    async callbackQr(@Body() xenditCallbackData: any): Promise<any> {
        try {

            const status = xenditCallbackData?.data?.status;

            const qr_id = xenditCallbackData?.data?.qr_id;
        
            const updatePayment = await this.xenditService.updatePayment(
                qr_id,
                status
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
        @Param("id") reference_id: string
    ) {
        return this.xenditService.getData(bank_code, reference_id)
    }
}