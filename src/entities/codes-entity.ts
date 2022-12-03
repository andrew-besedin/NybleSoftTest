import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import User from "./user-entity";

@Entity()
export default class Codes {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: string

    @Column({ nullable: true })
    registerCode: string

    @OneToOne(() => User)
    user: User
}