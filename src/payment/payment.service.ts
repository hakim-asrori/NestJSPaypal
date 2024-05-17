import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import axios from "axios";
import { Payment } from "./entities/payment.entity";
import { Repository } from "typeorm";
import { CreatePaymentDto } from "./dto/create-payment.dto";

@Injectable()
export class PaymentService {

    constructor(@InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>) {}

    private async getAccessToken() {

        try {
            const clientId = "ASxqJlHZbmgIAcThVWoeeQDQWdN1YN7bTvg6gmjzjmyXVBEo7wRtdF5xUPPoERrwtyvSidaTK4G1tfjm"
            const clientSecret = "EEm8he_FHHmziZy9pKNPCDqgGeLwo5neF1AOW--r7vS2rC2wghISX5V1b3kb6PsZXcULiQLpsxioEYJL"
            const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

            const params = new URLSearchParams()
            params.append("grant_type", "client_credentials")

            const response = await axios.post("https://api-m.sandbox.paypal.com/v1/oauth2/token",
                params.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Authorization': `Basic ${auth}`
                    }
                })
            return response.data.access_token

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error response data:', error.response?.data);
                console.error('Error response status:', error.response?.status);
                console.error('Error response headers:', error.response?.headers);
            } else {
                console.error('Unexpected error:', error.message);
            }
            throw error;
        }
    }

    public async orders(createPaymentDto: CreatePaymentDto) {

        const accessToken = await this.getAccessToken()
    
        const orderData = {
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "items": [
                        {
                            "name": "Hamdan",
                            "description": "Green XL",
                            "quantity": "1",
                            "unit_amount": {
                                "currency_code": "USD",
                                "value": "350.00"
                            }
                        }
                    ],
                    "amount": {
                        "currency_code": "USD",
                        "value": "350.00",
                        "breakdown": {
                            "item_total": {
                                "currency_code": "USD",
                                "value": "350.00"
                            }
                        }
                    }
                }
            ],
            "application_context": {
                "return_url": "https://rtqulilalbab.com/",
                "cancel_url": "https://app.tnosworld.com/"
            }
        };

        try {

            const response = await axios.post("https://api-m.sandbox.paypal.com/v2/checkout/orders",
                orderData,
                {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            })

            const getData = await axios.get(`https://api.sandbox.paypal.com/v2/checkout/orders/${response.data.id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            })

            console.log(getData);

            await this.create(createPaymentDto)

            return response.data

        } catch (error) {
            
            console.error('Error creating PayPal order:', error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                console.error('Response headers:', error.response.headers);
            }

            throw error;
        }
    }

    async create(dto: CreatePaymentDto) {
        const users = this.paymentRepository.create({
            "amount": 1000,
            "currency": "USD",
            "status": "APPROVED",
            "payment_method": "PAYPAL",
            "bank_code": "PAYPAL"
        })
    
        return await this.paymentRepository.save(users)
    }

}