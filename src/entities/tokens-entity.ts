import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, OneToOne, JoinColumn } from "typeorm";
import User from "./user-entity";

@Entity()
export default class Tokens {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: string;

    @Column({ nullable: true })
    loginCode: string

    @Column({ nullable: true })
    loginTimeout: string

    @Column()
    token: string

    @Column({ nullable: true })
    tokenTimeout: string

    @ManyToOne(() => User)
    @JoinColumn()
    user: User

    @Column()
    userId: string
}