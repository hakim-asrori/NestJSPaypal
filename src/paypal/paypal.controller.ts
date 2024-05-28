import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { AppGateway } from "src/service_modules/app.gateway";
import { PaypalService } from "./paypal.service";
import { log } from "console";
import { eventEmitterService } from "src/components/services/event-emitter.service";
import { CreateVADto } from "src/components/dto/create-va.dto";

@Controller("paypal")
export class PaypalController {

    constructor(
        private paypalService: PaypalService,
        private appGateway: AppGateway,
    ) { }

    @Post("create")
    async paypalCreate(@Body() createPaypal: CreateVADto): Promise<any> {
        return await this.paypalService.createPaypal(createPaypal)
    }

    @Post('callback')
    @HttpCode(HttpStatus.OK)
    async callbackPaypal(@Body() paypalCallbackData: any): Promise<any> {
        const paypalId = paypalCallbackData?.resource.id;
        const externalId = paypalCallbackData?.resource.id;
        const status = paypalCallbackData?.resource.status;

        log('Received PayPal Callback:', paypalCallbackData);

        const isProcessed = await this.paypalService.isCallbackProcessed(paypalId);
        if (isProcessed) {
            log('Callback already processed for PayPal ID:', paypalId);
            return { status: 'Already Processed' };
        }

        await this.paypalService.updatePayment(paypalId, externalId, status);
        await this.paypalService.markCallbackAsProcessed(paypalId);

        eventEmitterService.emit('triggerCapture', { paypalId, status });

        return { status: 'Success', data: paypalCallbackData };
    }

    @Post('capture')
    @HttpCode(HttpStatus.OK)
    async capture(@Body() captureCallbackData: any): Promise<any> {
        return this.paypalService.capture(captureCallbackData);
    }
}