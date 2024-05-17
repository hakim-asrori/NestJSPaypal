import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Xendit } from "./entities/xendit.entity";
import { Repository } from "typeorm";
import axios from "axios";
import { CreateXenditDto } from "./dto/create-xendit.dto";

@Injectable()
export class XenditService {

    constructor(@InjectRepository(Xendit) private readonly xenditRepository: Repository<Xendit>) {}

    private getAccessToken() {
        try {
            const username = 'xnd_development_7kWjixnClUSbCEVa35SjG7etTZpEWWN32V9jAOn1C22t6Uq8he1uJPKj3kYg4U04';
            const password = '';
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

    async createQrXendit() {
        const accessToken = this.getAccessToken();
        const externalId = this.generateRandomId(16);
        const referenceId = this.generateRandomId(16);
        const expiresAt = this.getExpiresAt(60);

        try {
            const response = await axios.post(
                'https://api.xendit.co/qr_codes',
                {
                    external_id: externalId,
                    reference_id: referenceId,
                    type: 'DYNAMIC',
                    currency: 'IDR',
                    amount: 10000,
                    expires_at: expiresAt
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
                qr_id: responseData.id,
                external_id: externalId,
                amount: responseData.amount,
                status: responseData.status,
                payment_method: "QRIS",
                bank_code: responseData.channel_code,
                expires_at: responseData.expires_at
            })

            await this.xenditRepository.save(saveToTheDatabase)

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
                    qr_id: qr_id
                }
            })

            payment.status = status

            const updatePayment = await this.xenditRepository.save(payment)

            return updatePayment
        
        } catch (error) {

            console.log(error);
            
            throw error
        }
    }

    async getData(
        bank_code: string,
        qr_id: string
    ) {
        try {

            const getData = await this.xenditRepository.findOne({
                where: {
                    bank_code, qr_id
                }
            })

            return getData
            
            
        } catch (error) {
            
            console.log(error);
            
            throw error
        }
    }
}