export const userEntityContent = `
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from './base';
import { Role } from './role';

@Entity()
export class User extends Base {
    @Column({ length: 50, nullable: false, type: 'char', unique: true })
    email!: string;

    @Column({ default: 0, nullable: false, type: 'tinyint', unsigned: true })
    height!: number;

    @Column({ nullable: true, type: 'text' })
    forgot_password_token?: string | null;

    @Column({ default: 0, nullable: false, type: 'tinyint', unsigned: true })
    login_attempts!: number;

    @Column({ nullable: false, type: 'tinytext' })
    password!: string;

    @Column({ default: false, nullable: false, type: 'boolean' })
    two_factor_authentication_scanned!: boolean;

    @Column({ length: 100, nullable: true, type: 'char' })
    two_factor_authentication_secret?: string | null;

    @Column({ nullable: true, type: 'text' })
    two_factor_authentication_token?: string | null;

    @Column({ nullable: true, type: 'text' })
    user_token?: string | null;

    @Column({ nullable: true, type: 'text' })
    email_token?: string | null;

    @ManyToOne(() => Role, (role) => role.users, {
        eager: true,
    })
    @JoinColumn([{ name: 'role_id', referencedColumnName: 'id' }])
    role!: Role;

    @Column({ default: false, nullable: false, type: 'boolean' })
    invalid_created!: boolean;

    @Column({
        type: 'tinytext',
        nullable: true,
    })
    last_active_date?: string | null;

    @Column({ default: false, nullable: false, type: 'boolean' })
    last_active_valid!: boolean;
}

`;
