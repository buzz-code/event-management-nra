// filepath: /root/code-server/config/workspace/event-management-nra/server/src/db/entities/LevelType.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { CrudValidationGroups } from '@dataui/crud';
import { IsNotEmpty, MaxLength, IsNumber } from '@shared/utils/validation/class-validator-he';
import { StringType, NumberType } from '@shared/utils/entity/class-transformer';
import { IsOptional } from 'class-validator';
import { IHasUserId } from '@shared/base-entity/interface';
import { fillDefaultYearValue } from '@shared/utils/entity/year.util';

@Entity('level_types')
@Index('level_types_user_id_idx', ['userId'], {})
export class LevelType implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  fillFields() {
    fillDefaultYearValue(this);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ length: 255 })
  name: string;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({}, { always: true })
  @Column('int')
  key: number;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(1000, { always: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  year: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // @OneToMany(() => Event, event => event.levelType)
  // events: Event[];
}
