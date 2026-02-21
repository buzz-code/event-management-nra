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
import { IsNumber, MaxLength } from '@shared/utils/validation/class-validator-he';
import { NumberType, StringType } from '@shared/utils/entity/class-transformer';
import { IHasUserId } from '@shared/base-entity/interface';
import { fillDefaultYearValue } from '@shared/utils/entity/year.util';
import { User } from './User.entity';
import { Teacher } from './Teacher.entity';

@Entity('family_teacher_assignment')
@Index('fta_user_id_idx', ['userId'], {})
@Index('fta_year_idx', ['year'], {})
@Index('fta_family_reference_id_idx', ['familyReferenceId'], {})
@Index('fta_teacher_reference_id_idx', ['teacherReferenceId'], {})
export class FamilyTeacherAssignment implements IHasUserId {
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

  @IsOptional({ always: true })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ length: 255, nullable: true })
  familyReferenceId: string;

  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  teacherReferenceId: number;

  @IsOptional({ always: true })
  @Column({ type: 'simple-json', nullable: true })
  historyJson: { eventId: number; teacherReferenceId: number; assignedAt: string; source: string }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Teacher, { nullable: true })
  @JoinColumn({ name: 'teacherReferenceId' })
  teacher: Teacher;
}
