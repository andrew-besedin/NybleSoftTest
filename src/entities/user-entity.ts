import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from "typeorm";
import Codes from "./codes-entity";

@Entity()
export default class User {
    @PrimaryGeneratedColumn({ type: "bigint" })
    id: string

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    email: string

    @Column({ nullable: true })
    image: string

    @OneToOne(() => Codes)
    @JoinColumn()
    codes: Codes

    @Column({ nullable: true })
    codesId: string
}