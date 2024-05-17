import { Body, Controller, Get, Post } from "@nestjs/common";
import { PaymentService } from "./payment.service";
import { CreatePaymentDto } from "./dto/create-payment.dto";

@Controller("paypal")
export class PaymentController {

    constructor(private paymentService: PaymentService) {}

    @Post("orders")
    async orders(@Body() createPaymentDto: CreatePaymentDto) {
        return this.paymentService.orders(createPaymentDto)
    }

}