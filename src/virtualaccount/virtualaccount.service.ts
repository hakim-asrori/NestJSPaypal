import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import axios from "axios";
import { Xendit } from "src/components/entities/xendit.entity";
import { PaymentLog } from "src/components/entities/payment-log.entity";

@Injectable()
export class VirtualAccountService {

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

    async createVirtualAccount(request: any) {

        const accessToken = this.getAccessToken();
        const externalId = this.generateRandomId(16);
        const expiresAt = this.getExpiresAt(60);

        const currentTime = Date.now();

        try {
            const response = await axios.post(
                'https://api.xendit.co/callback_virtual_accounts',
                {
                    external_id: request.id + "-" + currentTime,
                    bank_code: request.bank_code,
                    name: request.name,
                    currency: "IDR",
                    is_closed: true,
                    is_single_use: true,
                    expected_amount: request.amount,
                    expiration_date: expiresAt
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

            const saveToTheDatabase = this.xenditRepository.create({
                xendit_id: responseData.id,
                business_id: responseData.owner_id,
                reference_id: responseData.external_id,
                amount: request.amount,
                status: responseData.status,
                merchant_code: responseData.merchant_code,
                bank_code: responseData.bank_code,
                description: "-",
                customer: JSON.stringify({
                    name: request.name,
                    email: request.email,
                    phone: request.phone
                }),
                items: request.items,
                actions: "-",
                country: responseData.country,
                account_number: responseData.account_number,
                is_closed: responseData.is_closed,
                is_single_use: responseData.is_single_use,
                payment_method: "VIRTUAL ACCOUNT",
                payment_channel: responseData.bank_code,
                expiration_date: responseData.expiration_date,
                others: "-"
            })

            const paymentData = await this.xenditRepository.save(saveToTheDatabase)
            
            const paymentLog = this.paymentLogRepository.create({
                transaction_id: paymentData.id,
                amount: saveToTheDatabase.amount,
                currency: "IDR",
                payment_method: saveToTheDatabase.payment_method,
                bank_code: saveToTheDatabase.bank_code,
                status: saveToTheDatabase.status,
                description: "Create Virtual Accounts"
            })

            await this.paymentLogRepository.save(paymentLog)
            
            return response.data

        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async updatePayment(
        external_id: string
    ) {
        try {

            const payment = await this.xenditRepository.findOne({
                where: {
                    reference_id: external_id
                }
            })

            payment.status = "PAID"

            const updatePayment = await this.xenditRepository.save(payment)

            const paymentLog = this.paymentLogRepository.create({
                transaction_id: updatePayment.id,
                amount: updatePayment.amount,
                currency: "IDR",
                payment_method: updatePayment.payment_method,
                bank_code: updatePayment.bank_code,
                status: updatePayment.status,
                description: "Callback Virtual Accounts"
            })
            
            await this.paymentLogRepository.save(paymentLog)

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