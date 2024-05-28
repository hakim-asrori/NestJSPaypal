import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import axios from "axios";
import { Xendit } from "src/components/entities/xendit.entity";
import { PaymentLog } from "src/components/entities/payment-log.entity";

@Injectable()
export class PaypalService {
    constructor(
        @InjectRepository(Xendit) private readonly xenditRepository: Repository<Xendit>,
        @InjectRepository(PaymentLog) private readonly paymentLogRepository: Repository<PaymentLog>
    ) { }

    private accessToken: string | null = null;
    private tokenExpiresAt: number | null = null;
    private processedCallbacks: Set<string> = new Set();

    private async getAccessToken(): Promise<string> {
        if (this.accessToken && this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
            return this.accessToken;
        }

        const username = process.env.PAYPAL_CLIENT_ID;
        const password = process.env.PAYPAL_CLIENT_SECRET;
        const auth = Buffer.from(`${username}:${password}`).toString('base64');

        const params = new URLSearchParams();
        params.append("grant_type", "client_credentials");

        try {
            const response = await axios.post(
                `${process.env.PORT_PAYPAL}/v1/oauth2/token`,
                params,
                {
                    headers: {
                        'Authorization': `Basic ${auth}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            this.accessToken = response.data.access_token;
            this.tokenExpiresAt = Date.now() + response.data.expires_in * 1000;

            return this.accessToken;
        } catch (error) {
            console.log('Error fetching access token:', error);
            throw error;
        }
    }

    async createPaypal(request: any) {
        const accessToken = await this.getAccessToken();
        const externalId = this.generateRandomId(16);
        const expiresAt = this.getExpiresAt(60);

        const port_custom = process.env.PORT_PAYMENT_CUSTOM
        
        try {
            const response = await axios.post(
                `${process.env.PORT_PAYPAL}/v2/checkout/orders`,
                {
                    intent: "CAPTURE",
                    purchase_units: [
                        {
                            items: [
                                {
                                    name: request.items,
                                    description: request.description ? request.description : null,
                                    quantity: "1",
                                    unit_amount: {
                                        currency_code: "USD",
                                        value: `${request.amount}` // Sesuaikan dengan konversi ke IDR
                                    }
                                }
                            ],
                            amount: {
                                currency_code: "USD",
                                value: `${request.amount}`, // Sesuaikan dengan konversi ke IDR
                                breakdown: {
                                    item_total: {
                                        currency_code: "USD",
                                        value: `${request.amount}`// Sesuaikan dengan konversi ke IDR
                                    }
                                }
                            }
                        }
                    ],
                    application_context: {
                        return_url: `${port_custom}/payment/success`,
                        cancel_url: "https://example.com/cancel"
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                        'Prefer': 'return=representation',
                    }
                }
            );

            const responseData = response.data

            const paymentPaypal = this.xenditRepository.create({

                xendit_id: responseData.id,
                reference_id: responseData.purchase_units.reference_id,
                amount: parseInt(responseData.purchase_units[0].amount.value),
                status: responseData.status,
                description: "-",
                customer: JSON.stringify({
                    name: request.name,
                    email: request.email,
                    phone: request.phone
                }),
                items: JSON.stringify(responseData.purchase_units[0].items[0]),
                actions: "-",
                payment_method: "PAYPAL",
                others: "-"
            });

            const responseDataPaypal = await this.xenditRepository.save(paymentPaypal);

            const paymentLog = this.paymentLogRepository.create({
                transaction_id: responseDataPaypal.id,
                amount: paymentPaypal.amount,
                currency: "USD",
                payment_method: paymentPaypal.payment_method,
                status: paymentPaypal.status,
                description: "Create Paypal"
            })

            await this.paymentLogRepository.save(paymentLog);

            return response.data;

        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async updatePayment(
        paypalId: string,
        externalId: string,
        status: string
    ) {
        try {
            const payment = await this.xenditRepository.findOne({
                where: {
                    xendit_id: paypalId
                }
            })

            payment.status = status;

            const updatePayment = await this.xenditRepository.save(payment);

            return updatePayment;

        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    async isCallbackProcessed(paypalId: string): Promise<boolean> {
        // Check in-memory set for simplicity; consider using a database in production
        return this.processedCallbacks.has(paypalId);
    }

    async markCallbackAsProcessed(paypalId: string): Promise<void> {
        // Add to in-memory set; consider using a database in production
        this.processedCallbacks.add(paypalId);
    }

    // Sandbox
    // async captureOrder(paypalId: string): Promise<any> {
    //     const accessToken = await this.getAccessToken();

    //     try {
    //         const response = await axios.post(
    //             `https://api-m.sandbox.paypal.com/v2/checkout/orders/${paypalId}/capture`,
    //             {},
    //             {
    //                 headers: {
    //                     'Authorization': `Bearer ${accessToken}`,
    //                     'Content-Type': 'application/json'
    //                 }
    //             }
    //         );

    //         console.log('Capture response:', response.data);
    //         return response.data;
    //     } catch (error) {
    //         console.log('Error capturing order:', error);
    //         throw error;
    //     }
    // }

    // Production
    async captureOrder(paypalId: string): Promise<any> {
        const accessToken = await this.getAccessToken();

        try {
            const response = await axios.post(
                `${process.env.PORT_PAYPAL}/v2/checkout/orders/${paypalId}/capture`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Capture response:', response.data);
            return response.data;
        } catch (error) {
            console.log('Error capturing order:', error);
            throw error;
        }
    }

    async capture(data: any): Promise<any> {
        console.log('Capturing payment with data:', data);

        const { paypalId, status } = data;

        if (status === 'APPROVED') {
            const captureResponse = await this.captureOrder(paypalId);

            // Update payment status to captured in your database
            const payment = await this.xenditRepository.findOne({
                where: { xendit_id: paypalId }
            });

            if (payment) {
                payment.status = 'COMPLETED';
                await this.xenditRepository.save(payment);

                console.log('Payment successfully captured:', payment);
                return { status: 'Success', data: captureResponse };
            } else {
                console.log('Payment not found for PayPal ID:', paypalId);
                return { status: 'Error', message: 'Payment not found' };
            }
        } else {
            console.log('Payment not approved, cannot capture.');
            return { status: 'Error', message: 'Payment not approved' };
        }
    }

    private generateRandomId(length: number): string {
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
}
