import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import axios from "axios";

@Injectable()
export class BankService {

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

    async listBank() {
        const accessToken = this.getAccessToken()

        try {

            const response = await axios.get(
                "https://api.xendit.co/available_virtual_account_banks", {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Basic ${accessToken}`,
                        'api-version': '2022-07-31'
                    }
                }
            )
            
            const filteredBanks = response.data.filter(bank => bank.is_activated === true && bank.currency == "IDR");

            return filteredBanks

        } catch (error) {

            console.log(error);
            
            throw error
        }
    }
}