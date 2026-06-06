import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { IsOptional } from 'class-validator';
import { CrudValidationGroups } from '@dataui/crud';
import { IsNotEmpty, IsNumber, MaxLength } from '@shared/utils/validation/class-validator-he';
import { NumberType, StringType } from '@shared/utils/entity/class-transformer';
import { IHasUserId } from '@shared/base-entity/interface';
import { fillDefaultYearValue } from '@shared/utils/entity/year.util';
import { User } from './User.entity';

@Entity('teacher_assignment_rules')
@Index('tar_user_id_idx', ['userId'], {})
@Index('tar_year_idx', ['year'], {})
@Index('tar_is_active_idx', ['isActive'], {})
@Index('tar_order_idx', ['order'], {})
export class TeacherAssignmentRule implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  fillFields() {
    fillDefaultYearValue(this);
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  year: number;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ type: 'int', default: 1 })
  order: number;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ length: 255 })
  gradeLevelKey: string;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @Column({ type: 'simple-json' })
  teacherReferenceIds: number[];

  @IsOptional({ always: true })
  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
