import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import axios from "axios";
import { Ewallet } from "./entities/ewallet.entity";
import { Xendit } from "src/components/entities/xendit.entity";
import { PaymentLog } from "src/components/entities/payment-log.entity";

@Injectable()
export class EwalletService {

    constructor(
        @InjectRepository(Ewallet) private readonly ewalletRepository: Repository<Ewallet>,
        @InjectRepository(Xendit) private readonly xenditRepository: Repository<Xendit>,
        @InjectRepository(PaymentLog) private readonly paymentLogRepository: Repository<PaymentLog>
    ) {}

    private getAccessToken() {
        try {
            const username = process.env.XENDIT_USERNAME;
            const password = process.env.XENDIT_PASSWORD;
            const auth = Buffer.from(`${username}:${password}`).toString('base64');
            return auth;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    private generateRandomId(length: number) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    private getExpiresAt(durationInMinutes: number): string {
        const now = new Date();
        now.setMinutes(now.getMinutes() + durationInMinutes);
        
        // Adjusting to Indonesia time (GMT+7)
        const indonesiaOffset = 7 * 60; // Offset in minutes
        const localTime = new Date(now.getTime() + indonesiaOffset * 60 * 1000);

        const isoString = localTime.toISOString();
        const formattedIsoString = isoString.replace(/\.\d{3}Z$/, 'Z'); // Remove milliseconds
        return formattedIsoString;
    }

    async listEwallet() {
        try {

            const response = await this.ewalletRepository.find()
                    
            return response

        } catch (error) {

            console.log(error);
            
            throw error
        }
    }

    async createEwallet(request: any) {
        const accessToken = this.getAccessToken();
        const externalId = this.generateRandomId(16);
        const expiresAt = this.getExpiresAt(60);
    
        const port_custom = process.env.PORT_PAYMENT_CUSTOM

        try {
            const channelCode = request.channel_code;
    
            type ChannelProperties = {
                success_redirect_url: string;
                failure_redirect_url: string;
                mobile_number?: string;
            };
    
            const channelConfigurations: Record<string, ChannelProperties> = {
                "ID_OVO": {
                    success_redirect_url: `${port_custom}/payment/success`,
                    failure_redirect_url: "https://rtqulilalbab.com/",
                    mobile_number: request.mobile_number
                    // mobile_number: "+6281284360207"
                },

                "ID_ASTRAPAY": {
                    success_redirect_url: `${port_custom}/payment/success`,
                    failure_redirect_url: "https://rtqulilalbab.com/"
                },

                "ID_LINKAJA": {
                    success_redirect_url: `${port_custom}/payment/success`,
                    failure_redirect_url: "https://rtqulilalbab.com/"
                }
            };
    
            const channelProperties: ChannelProperties = channelConfigurations[channelCode] || {
                success_redirect_url: `${port_custom}/payment/success`,
                failure_redirect_url: "https://rtqulilalbab.com/"
            };
    
            const response = await axios.post(
                'https://api.xendit.co/ewallets/charges',
                {
                    reference_id: externalId,
                    currency: "IDR",
                    amount: request.amount,
                    checkout_method: "ONE_TIME_PAYMENT",
                    channel_code: channelCode,
                    channel_properties: channelProperties,
                    metadata: {
                        branch_area: null,
                        branch_city: null
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${accessToken}`,
                        'api-version': '2022-07-31'
                    },
                }
            );
    
            const responseData = response.data;
    
            const paymentData = this.xenditRepository.create({
                invoice_id: "TRX-" + responseData.reference_id,
                reference_id: "tnos-" + responseData.reference_id,
                currency: "IDR",
                external_id: responseData.reference_id,
                amount: responseData.charge_amount,
                status: responseData.status,
                payment_method: "EWALLET",
                bank_code: responseData.channel_code,
                expires_at: expiresAt
            });
    
            const responseDataEwallet = await this.xenditRepository.save(paymentData);

            const paymentLog = this.paymentLogRepository.create({
                transaction_id: responseDataEwallet.id,
                amount: paymentData.amount,
                currency: paymentData.currency,
                payment_method: paymentData.payment_method,
                bank_code: paymentData.bank_code,
                status: paymentData.status,
                description: "Create Ewallet"
            })

            await this.paymentLogRepository.save(paymentLog);
            
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async updatePayment(
        external_id: string,
        status: string
    ) {
        try {

            const payment = await this.xenditRepository.findOne({
                where: {
                    external_id: external_id
                }
            })

            payment.status = status
            payment.status_pembayaran = "SUCCESS"

            const updatePayment = await this.xenditRepository.save(payment)

            const paymentLog = this.paymentLogRepository.create({
                transaction_id: updatePayment.id,
                amount: updatePayment.amount,
                currency: updatePayment.currency,
                payment_method: updatePayment.payment_method,
                bank_code: updatePayment.bank_code,
                status: updatePayment.status,
                description: "Callback Ewallet"
            })

            await this.paymentLogRepository.save(paymentLog)

            return updatePayment

        } catch (error) {

            console.log(error);

            throw error
            
        }
    }
    
}