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
import { IsNumber } from '@shared/utils/validation/class-validator-he';
import { NumberType } from '@shared/utils/entity/class-transformer';
import { IHasUserId } from '@shared/base-entity/interface';
import { fillDefaultYearValue } from '@shared/utils/entity/year.util';
import { User } from './User.entity';
import { Teacher } from './Teacher.entity';

@Entity('teacher_assignment_rules')
@Index('tar_user_id_idx', ['userId'], {})
@Index('tar_year_idx', ['year'], {})
@Index('tar_is_active_idx', ['isActive'], {})
@Index('tar_teacher_reference_id_idx', ['teacherReferenceId'], {})
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

  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  teacherReferenceId: number;

  @IsOptional({ always: true })
  @Column({ type: 'simple-json', nullable: true })
  classRulesJson: { classReferenceId: number }[];

  @IsOptional({ always: true })
  @Column({ type: 'simple-json', nullable: true })
  gradeRulesJson: { grade: string }[];

  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 4 }, { always: true })
  @Column({ type: 'decimal', precision: 7, scale: 4, nullable: true })
  customRatio: number;

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

  @ManyToOne(() => Teacher, { nullable: true })
  @JoinColumn({ name: 'teacherReferenceId' })
  teacher: Teacher;
}
