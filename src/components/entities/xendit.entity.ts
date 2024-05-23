import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
    name: "xendits"
})

export class Xendit {

    @PrimaryGeneratedColumn()
    id: number

    @Column({length: 150})
    invoice_id: string

    @Column({ length: 150, nullable: true })
    reference_id: string

    @Column({length: 255})
    external_id: string

    @Column()
    amount: number

    @Column({ nullable: true })
    is_closed: boolean

    @Column({ nullable: true })
    is_single_use: boolean

    @Column({ length: 15 })
    currency: string

    @Column({length: 40})
    payment_method: string

    @Column({ length: 50, nullable: true })
    payment_channel: string

    @Column({ length: 50 })
    bank_code: string

    @Column({length: 255})
    status: string

    @Column({ length: 150, nullable: true })
    status_pembayaran: string

    @Column({ length: 150 })
    expires_at: string

    @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
    created_at: Date

    @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
    updated_at: Date

}