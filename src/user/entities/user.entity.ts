import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity({
    name: "users"
})

export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column({length: 255})
    fullname: string

    @Column("date")
    birthday: Date

    @Column()
    isActive: boolean

}