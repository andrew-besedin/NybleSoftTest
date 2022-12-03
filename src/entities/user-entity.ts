import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany } from "typeorm";
import Codes from "./codes-entity";
import Tokens from "./tokens-entity";

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

    @OneToMany(() => Tokens, tokens => tokens.user)
    tokens: Tokens

    @Column({ nullable: true })
    codesId: string
}