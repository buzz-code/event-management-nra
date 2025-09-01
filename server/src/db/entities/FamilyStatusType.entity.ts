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

@Entity('family_status_types')
@Index('family_status_types_user_id_idx', ['userId'], {})
export class FamilyStatusType implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  fillFields() { }

  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({}, { always: true })
  @Column('int')
  key: number;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ length: 255 })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // @OneToMany(() => Student, student => student.familyStatusType)
  // students: Student[];
}
