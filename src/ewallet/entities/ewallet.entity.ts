import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name: "list_ewallet"
})

export class Ewallet {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ length: 100 })
    name: string

    @Column({ length: 30 })
    code: string

}