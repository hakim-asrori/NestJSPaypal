export class CreateXenditDto {
    qr_id: string
    externalId: string
    amount: number
    status: string
    payment_method: string
    bank_code: string
    expires_at: Date
}
