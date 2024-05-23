import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
    name: "payment_log"
})

export class PaymentLog {

    @PrimaryGeneratedColumn()
    id: number

    @Column({length: 150})
    paypal_id: string

    @Column()
    amount: number

    @Column({ length: 15 })
    currency: string

    @Column({length: 40})
    payment_method: String

    @Column({length: 255})
    status: string

    @Column({length: 255})
    description: string

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date

}