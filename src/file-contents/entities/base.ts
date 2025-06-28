export const baseEntityContent = `
import {
    AfterInsert,
    AfterUpdate,
    BeforeRemove,
    CreateDateColumn,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export class Base {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number;

    @CreateDateColumn()
    date_created!: string;

    @UpdateDateColumn({ nullable: true })
    date_last_modified!: string;

    user_action_id?: number;

    @AfterInsert()
    sendCreateLog() {
        // const data = {
        //     action: 'create',
        //     user_id: this.user_action_id ? this.user_action_id : 0,
        //     entity_id: this.id,
        //     entity_name: this.constructor.name,
        //     data: JSON.stringify(this.getData()),
        // };
    }

    @AfterUpdate()
    sendUpdateLog() {
        // const data = {
        //     action: 'update',
        //     user_id: this.user_action_id ? this.user_action_id : 0,
        //     entity_id: this.id,
        //     entity_name: this.constructor.name,
        //     data: JSON.stringify(this.getData()),
        // };
    }

    @BeforeRemove()
    sendRemoveLog() {
        // const data = {
        //     action: 'delete',
        //     user_id: this.user_action_id ? this.user_action_id : 0,
        //     entity_id: this.id,
        //     entity_name: this.constructor.name,
        //     data: JSON.stringify(this.getData()),
        // };
    }

    public getData() {
        const data = [];

        for (const key in this) {
            if (
                key != 'getData' &&
                key != 'sendUpdateLog' &&
                key != 'sendDeleteLog' &&
                key != 'sendRemoveLog' &&
                key != 'sendCreateLog'
            ) {
                data.push({
                    key: key,
                    value: this[key],
                });
            }
        }
        return data;
    }
}

`;
