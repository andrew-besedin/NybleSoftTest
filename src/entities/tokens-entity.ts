import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";
import User from "./user-entity";

@Entity()
export default class Tokens {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: string;

    @Column()
    loginCode: string

    @Column()
    token: string

    @ManyToOne(() => User)
    @JoinColumn()
    user: User

    @Column()
    userId: string
}