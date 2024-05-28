import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({
    name: "pembayaran"
})

export class Xendit {

    @PrimaryGeneratedColumn()
    id: number

    @Column({length: 255, nullable: true})
    xendit_id: string

    @Column({length: 150, nullable: true})
    business_id: string

    @Column({ length: 150, nullable: true })
    reference_id: string

    @Column()
    amount: number

    @Column({length: 255})
    status: string
    
    @Column({length: 150, nullable: true})
    merchant_code: string

    @Column({ length: 50, nullable: true })
    bank_code: string

    @Column({ length: 255 })
    description: string

    @Column({ length: 255 })
    customer: string

    @Column({ length: 255 })
    items: string

    @Column({type: "text"})
    actions: string

    @Column({ length: 50, nullable: true })
    country: string

    @Column({ length: 150, nullable: true })
    account_number: string

    @Column({ nullable: true })
    is_closed: boolean

    @Column({ nullable: true })
    is_single_use: boolean

    @Column({length: 40})
    payment_method: string

    @Column({ length: 50, nullable: true })
    payment_channel: string

    @Column({ length: 150, nullable: true })
    expiration_date: string

    @Column({ length: 150, nullable: true })
    others: string

    @BeforeInsert()
    setDefaultActions() {
        if (!this.actions) {
            this.actions = "-";
        }
    }
}