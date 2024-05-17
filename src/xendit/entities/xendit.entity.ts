import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name: "xendits"
})

export class Xendit {

    @PrimaryGeneratedColumn()
    id: number

    @Column({length: 255})
    qr_id: string

    @Column({length: 255})
    external_id: string

    @Column()
    amount: number
    
    @Column({length: 255})
    status: string

    @Column({length: 40})
    payment_method: string

    @Column({ length: 50 })
    bank_code: string

    @Column({ length: 150 })
    expires_at: string

}