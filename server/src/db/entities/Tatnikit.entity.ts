import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  Unique,
  BeforeInsert,
  BeforeUpdate,
  DataSource,
} from 'typeorm';
import { IsOptional, ValidateIf } from 'class-validator';
import { CrudValidationGroups } from '@dataui/crud';
import { IsNotEmpty, IsNumber } from '@shared/utils/validation/class-validator-he';
import { NumberType, StringType } from '@shared/utils/entity/class-transformer';
import { IHasUserId } from '@shared/base-entity/interface';
import { Student } from './Student.entity';
import { Class } from './Class.entity';
import { fillDefaultYearValue } from '@shared/utils/entity/year.util';
import { findOneAndAssignReferenceId, getDataSource } from '@shared/utils/entity/foreignKey.util';
import { FamilyStatusType } from './FamilyStatusType.entity';
import { Family } from '../view-entities/Family.entity';

@Entity('tatnikiot')
@Unique(['userId', 'classReferenceId', 'year'])
@Index('tatnikiot_user_id_idx', ['userId'], {})
@Index('tatnikiot_student_idx', ['studentReferenceId'], {})
@Index('tatnikiot_class_idx', ['classReferenceId'], {})
export class Tatnikit implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    fillDefaultYearValue(this);

    let dataSource: DataSource;
    try {
      dataSource = await getDataSource([Student, Class, FamilyStatusType, Family]);

      this.studentReferenceId = await findOneAndAssignReferenceId(
        dataSource,
        Student,
        { tz: this.studentTz },
        this.userId,
        this.studentReferenceId,
        this.studentTz,
      );
      this.classReferenceId = await findOneAndAssignReferenceId(
        dataSource,
        Class,
        { key: this.classKey },
        this.userId,
        this.classReferenceId,
        this.classKey,
      );
    } finally {
      dataSource?.destroy();
    }
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

  @ValidateIf((obj: Tatnikit) => !Boolean(obj.studentReferenceId), {
    always: true,
  })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @StringType
  @Column({ nullable: true })
  studentTz: string;

  @ValidateIf((obj: Tatnikit) => !Boolean(obj.studentTz) && Boolean(obj.studentReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  studentReferenceId: number;

  @ValidateIf((obj: Tatnikit) => !Boolean(obj.classReferenceId), {
    always: true,
  })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  classKey: number;

  @ValidateIf((obj: Tatnikit) => !Boolean(obj.classKey) && Boolean(obj.classReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  classReferenceId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Student, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentReferenceId' })
  student: Student;

  @ManyToOne(() => Class, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classReferenceId' })
  class: Class;
}
