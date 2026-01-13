import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
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
import { EventType } from './EventType.entity';
import { Class } from './Class.entity';
import { fillDefaultYearValue } from '@shared/utils/entity/year.util';
import { findOneAndAssignReferenceId, getDataSource } from '@shared/utils/entity/foreignKey.util';
import { FamilyStatusType } from './FamilyStatusType.entity';
import { Family } from '../view-entities/Family.entity';
import { cleanDateFields } from '@shared/utils/entity/deafultValues.util';

@Entity('unreported_events')
@Index('unreported_events_user_id_idx', ['userId'], {})
@Index('unreported_events_student_idx', ['studentReferenceId'], {})
@Index('unreported_events_event_type_idx', ['eventTypeReferenceId'], {})
@Index('unreported_events_reporter_idx', ['reporterStudentReferenceId'], {})
export class UnreportedEvent implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    fillDefaultYearValue(this);
    cleanDateFields(this, ['eventDate']);

    let dataSource: DataSource;
    try {
      dataSource = await getDataSource([Student, EventType, FamilyStatusType, Family]);

      this.studentReferenceId = await findOneAndAssignReferenceId(
        dataSource,
        Student,
        { tz: this.studentTz },
        this.userId,
        this.studentReferenceId,
        this.studentTz,
      );

      this.eventTypeReferenceId = await findOneAndAssignReferenceId(
        dataSource,
        EventType,
        { key: this.eventTypeKey, year: this.year },
        null,
        this.eventTypeReferenceId,
        this.eventTypeKey,
      );

      this.reporterStudentReferenceId = await findOneAndAssignReferenceId(
        dataSource,
        Student,
        { tz: this.reporterStudentTz },
        this.userId,
        this.reporterStudentReferenceId,
        this.reporterStudentTz,
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

  // Student being reported on
  @ValidateIf((obj: UnreportedEvent) => !Boolean(obj.studentReferenceId), {
    always: true,
  })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @StringType
  @Column({ nullable: true })
  studentTz: string;

  @ValidateIf((obj: UnreportedEvent) => !Boolean(obj.studentTz) && Boolean(obj.studentReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  studentReferenceId: number;

  @Column({ nullable: true })
  classReferenceId: number;

  // Event type
  @ValidateIf((obj: UnreportedEvent) => !Boolean(obj.eventTypeReferenceId), {
    always: true,
  })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  eventTypeKey: number;

  @ValidateIf((obj: UnreportedEvent) => !Boolean(obj.eventTypeKey) && Boolean(obj.eventTypeReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  eventTypeReferenceId: number;

  // Reporter (tatnikit) student
  @ValidateIf((obj: UnreportedEvent) => !Boolean(obj.reporterStudentReferenceId), {
    always: true,
  })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @StringType
  @Column({ nullable: true })
  reporterStudentTz: string;

  @ValidateIf((obj: UnreportedEvent) => !Boolean(obj.reporterStudentTz) && Boolean(obj.reporterStudentReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  reporterStudentReferenceId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Student, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studentReferenceId' })
  student: Student;

  @ManyToOne(() => Class, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'classReferenceId' })
  class: Class;

  @ManyToOne(() => EventType, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventTypeReferenceId' })
  eventType: EventType;

  @ManyToOne(() => Student, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporterStudentReferenceId' })
  reporterStudent: Student;
}
