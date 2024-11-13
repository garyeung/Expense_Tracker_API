import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Expense } from "./Expense.entity"

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: 'varchar',
        length: 100,
    })
    name: string

    @Column({
        type: 'varchar',
        length: 100,
        unique: true,
    })
    email: string

    @Column('varchar', {length: 255})
    password: string 

    @OneToMany(()=> Expense, (expense) => expense.user)
    expenses: Expense[]

}
