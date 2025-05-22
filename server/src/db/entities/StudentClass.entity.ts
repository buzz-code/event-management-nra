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
import { IsOptional, IsNumber, ValidateIf } from 'class-validator';
import { CrudValidationGroups } from '@dataui/crud';
import { IsNotEmpty } from '@shared/utils/validation/class-validator-he';
import { NumberType } from '@shared/utils/entity/class-transformer';
import { IHasUserId } from '@shared/base-entity/interface';
import { Student } from './Student.entity';
import { Class } from './Class.entity';
import { fillDefaultYearValue } from '@shared/utils/entity/year.util';
import { findOneAndAssignReferenceId, getDataSource } from '@shared/utils/entity/foreignKey.util';

@Entity('student_classes')
@Unique(['studentReferenceId', 'classReferenceId', 'year'])
@Index('student_classes_user_id_idx', ['userId'], {})
@Index('student_classes_student_idx', ['studentReferenceId'], {})
@Index('student_classes_class_idx', ['classReferenceId'], {})
export class StudentClass implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    fillDefaultYearValue(this);

    let dataSource: DataSource;
    try {
      dataSource = await getDataSource([Student, Class]);

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

  @ValidateIf((obj: StudentClass) => !Boolean(obj.studentReferenceId), {
    always: true,
  })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  studentTz: string;

  @ValidateIf((obj: StudentClass) => !Boolean(obj.studentTz) && Boolean(obj.studentReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  studentReferenceId: number;

  @ValidateIf((obj: StudentClass) => !Boolean(obj.classReferenceId), {
    always: true,
  })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  classKey: number;

  @ValidateIf((obj: StudentClass) => !Boolean(obj.classKey) && Boolean(obj.classReferenceId), { always: true })
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
