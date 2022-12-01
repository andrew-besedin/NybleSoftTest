import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export default class UsersInfo {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    email: string

    @Column({ nullable: true })
    image: string
}