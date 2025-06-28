export const roleEntityContent = `
import { OneToMany, Column, Entity } from 'typeorm';
import { Base } from './base';
import { User } from './user';

@Entity()
export class Role extends Base {
    @OneToMany(() => User, (user) => user.role)
    users?: User[];

    @Column({ nullable: false, type: 'tinytext' })
    name!: string;

    @Column({ nullable: false, type: 'tinytext' })
    alternate_name!: string;
}

`;
