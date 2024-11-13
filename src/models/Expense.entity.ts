import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./User.entity";
import { ExpenseCategory } from "./expense.interface";

@Entity()
export class Expense {
    @PrimaryGeneratedColumn()
    id: number

    @Column("text")
    description: string

    @Column("integer")
    amount: number

    @Column({
        type: "enum",
        enum: ExpenseCategory,
        default: ExpenseCategory.Others
    })
    category: ExpenseCategory 

    @CreateDateColumn()
    create_date: Date

    @UpdateDateColumn()
    update_date: Date

    @ManyToOne(() => User, (user) => user.expenses)
    user: User
}