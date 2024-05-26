import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import axios from "axios";
import { Xendit } from "src/components/entities/xendit.entity";
import { PaymentLog } from "src/components/entities/payment-log.entity";

@Injectable()
export class XenditService {

    constructor(
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

    async createQrXendit(request: any) {
        const accessToken = this.getAccessToken();
        const externalId = this.generateRandomId(16);
        const referenceId = this.generateRandomId(16);

        const currentTime = new Date();
        const expiresAt = new Date(currentTime.getTime() + (60 * 60 * 1000));

        try {
            const response = await axios.post(
                'https://api.xendit.co/qr_codes',
                {
                    external_id: externalId,
                    reference_id: referenceId,
                    type: 'DYNAMIC',
                    currency: 'IDR',
                    amount: request.amount,
                    expires_at: expiresAt.toISOString()
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${accessToken}`,
                        'api-version': '2022-07-31'
                    },
                },
            );

            const responseData = response.data

            const paymentQris = this.xenditRepository.create({
                invoice_id: "TNOS-INV-123",
                reference_id: responseData.id,
                external_id: externalId,
                amount: responseData.amount,
                status: responseData.status,
                payment_method: "QRIS",
                bank_code: responseData.channel_code,
                expires_at: responseData.expires_at,
                currency: "IDR"
            })

            const responseDataQris = await this.xenditRepository.save(paymentQris)

            const paymentLog = this.paymentLogRepository.create({
                transaction_id: responseDataQris.id,
                amount: paymentQris.amount,
                currency: paymentQris.currency,
                payment_method: paymentQris.payment_method,
                bank_code: paymentQris.bank_code,
                status: paymentQris.status,
                description: "Create QRIS"
            })

            await this.paymentLogRepository.save(paymentLog);

            return response.data

        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async updatePayment(
        qr_id: string,
        status: string
    ) {
        try {

            const payment = await this.xenditRepository.findOne({
                where: {
                    reference_id: qr_id
                }
            })

            payment.status = status

            const updatePayment = await this.xenditRepository.save(payment)

            const paymentLog = this.paymentLogRepository.create({
                transaction_id: updatePayment.id,
                amount: updatePayment.amount,
                currency: updatePayment.currency,
                payment_method: updatePayment.payment_method,
                bank_code: updatePayment.bank_code,
                status: updatePayment.status,
                description: "Callback QRIS"
            })

            await this.paymentLogRepository.save(paymentLog);

            return updatePayment
        
        } catch (error) {

            console.log(error);
            
            throw error
        }
    }

    async getData(
        bank_code: string,
        reference_id: string
    ) {
        try {

            const getData = await this.xenditRepository.findOne({
                where: {
                    bank_code, reference_id
                }
            })

            return getData
            
            
        } catch (error) {
            
            console.log(error);
            
            throw error
        }
    }
}