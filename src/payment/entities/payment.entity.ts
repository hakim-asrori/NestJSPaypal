import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name: "payment"
})

export class Payment {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    amount: number

    @Column({ length: 30 })
    currency: string
    
    @Column({length: 255})
    status: string

    @Column({length: 40})
    payment_method: string

    @Column({ length: 50 })
    bank_code: string

}