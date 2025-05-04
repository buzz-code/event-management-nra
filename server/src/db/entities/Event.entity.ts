import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, Index, BeforeInsert, BeforeUpdate, DataSource } from 'typeorm';
import { EventType } from './EventType.entity';
import { Teacher } from './Teacher.entity';
import { Student } from './Student.entity';
import { EventNote } from './EventNote.entity';
import { EventGift } from './EventGift.entity';
import { CoursePath } from './CoursePath.entity';
import { IsOptional, ValidateIf } from 'class-validator';
import { CrudValidationGroups } from '@dataui/crud';
import { IsNotEmpty, MaxLength, IsDate, IsNumber, Min } from '@shared/utils/validation/class-validator-he';
import { StringType, DateType, NumberType } from '@shared/utils/entity/class-transformer';
import { IHasUserId } from '@shared/base-entity/interface';
import { User } from './User.entity';
import { findOneAndAssignReferenceId, getDataSource } from '@shared/utils/entity/foreignKey.util';
import { cleanDateFields } from '@shared/utils/entity/deafultValues.util';

@Entity('events')
@Index('events_user_id_idx', ['userId'], {})
@Index('events_event_type_id_idx', ['eventTypeReferenceId'], {})
@Index('events_teacher_id_idx', ['teacherReferenceId'], {})
@Index('events_student_id_idx', ['studentReferenceId'], {})
@Index('events_course_path_id_idx', ['coursePathReferenceId'], {})
@Index('events_event_date_idx', ['eventDate'], {})
export class Event implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    cleanDateFields(this, ['eventDate']);

    let dataSource: DataSource;
    try {
      dataSource = await getDataSource([EventType, Teacher, Student, User, CoursePath]);

      this.eventTypeReferenceId = await findOneAndAssignReferenceId(
        dataSource, EventType, { key: this.eventTypeId }, null, this.eventTypeReferenceId, this.eventTypeId
      );
      
      this.teacherReferenceId = await findOneAndAssignReferenceId(
        dataSource, Teacher, { tz: this.teacherTz }, this.userId, this.teacherReferenceId, this.teacherTz
      );
      
      this.studentReferenceId = await findOneAndAssignReferenceId(
        dataSource, Student, { tz: this.studentTz }, this.userId, this.studentReferenceId, this.studentTz
      );
      
      this.coursePathReferenceId = await findOneAndAssignReferenceId(
        dataSource, CoursePath, { key: this.coursePathId }, this.userId, this.coursePathReferenceId, this.coursePathId
      );
    } finally {
      dataSource?.destroy();
    }
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ length: 255 })
  name: string;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(1000, { always: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @DateType
  @IsDate({ always: true })
  @Column()
  eventDate: Date;

  @IsOptional({ always: true })
  @Column({ default: false })
  completed: boolean;

  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 2 }, { always: true })
  @Min(0, { always: true })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  grade: number;

  @ValidateIf((event: Event) => !Boolean(event.eventTypeReferenceId), { always: true })
  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  eventTypeId: number;

  @ValidateIf((event: Event) => !Boolean(event.eventTypeId) && Boolean(event.eventTypeReferenceId), { always: true })
  @Column({ nullable: true })
  eventTypeReferenceId: number;

  @ValidateIf((event: Event) => !Boolean(event.teacherReferenceId), { always: true })
  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  teacherTz: number;

  @ValidateIf((event: Event) => !Boolean(event.teacherTz) && Boolean(event.teacherReferenceId), { always: true })
  @Column({ nullable: true })
  teacherReferenceId: number;

  @ValidateIf((event: Event) => !Boolean(event.studentReferenceId), { always: true })
  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  studentTz: number;

  @ValidateIf((event: Event) => !Boolean(event.studentTz) && Boolean(event.studentReferenceId), { always: true })
  @Column({ nullable: true })
  studentReferenceId: number;

  @ValidateIf((event: Event) => !Boolean(event.coursePathReferenceId), { always: true })
  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  coursePathId: number;

  @ValidateIf((event: Event) => !Boolean(event.coursePathId) && Boolean(event.coursePathReferenceId), { always: true })
  @Column({ nullable: true })
  coursePathReferenceId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => EventType, { nullable: true })
  @JoinColumn({ name: 'eventTypeReferenceId' })
  eventType: EventType;

  @ManyToOne(() => Teacher, { nullable: true })
  @JoinColumn({ name: 'teacherReferenceId' })
  teacher: Teacher;

  // @ManyToOne(() => Student, { nullable: true })
  // @JoinColumn({ name: 'studentReferenceId' })
  // student: Student;

  @ManyToOne(() => CoursePath, { nullable: true })
  @JoinColumn({ name: 'coursePathReferenceId' })
  coursePath: CoursePath;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;

  @OneToMany(() => EventNote, note => note.event)
  notes: EventNote[];

  @OneToMany(() => EventGift, eventGift => eventGift.event)
  eventGifts: EventGift[];
}