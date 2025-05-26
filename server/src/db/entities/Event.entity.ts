import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
  DataSource,
} from 'typeorm';
import { EventType } from './EventType.entity';
import { Teacher } from './Teacher.entity';
import { Student } from './Student.entity';
import { EventNote } from './EventNote.entity';
import { EventGift } from './EventGift.entity';
import { LevelType } from './LevelType.entity';
import { StudentClass } from './StudentClass.entity';
import { Class } from './Class.entity';
import { IsOptional, ValidateIf } from 'class-validator';
import { CrudValidationGroups } from '@dataui/crud';
import { IsNotEmpty, MaxLength, IsDate, IsNumber, Min } from '@shared/utils/validation/class-validator-he';
import { StringType, DateType, NumberType } from '@shared/utils/entity/class-transformer';
import { IHasUserId } from '@shared/base-entity/interface';
import { User } from './User.entity';
import { findOneAndAssignReferenceId, getDataSource } from '@shared/utils/entity/foreignKey.util';
import { cleanDateFields } from '@shared/utils/entity/deafultValues.util';
import { formatHebrewDate } from '@shared/utils/formatting/formatter.util';
import { fillDefaultYearValue, getCurrentHebrewYear } from '@shared/utils/entity/year.util';
import { Gift } from './Gift.entity';
import { getCurrentUser } from '@shared/utils/validation/current-user.util';

@Entity('events')
@Index('events_user_id_idx', ['userId'], {})
@Index('events_event_type_id_idx', ['eventTypeReferenceId'], {})
@Index('events_teacher_id_idx', ['teacherReferenceId'], {})
@Index('events_student_id_idx', ['studentReferenceId'], {})
@Index('events_level_type_id_idx', ['levelTypeReferenceId'], {})
@Index('events_event_date_idx', ['eventDate'], {})
@Index('events_event_hebrew_month_idx', ['eventHebrewMonth'], {})
@Index('events_student_class_reference_id_idx', ['studentClassReferenceId'], {})
export class Event implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    fillDefaultYearValue(this);
    cleanDateFields(this, ['eventDate', 'completionReportDate']);

    let dataSource: DataSource;
    try {
      dataSource = await getDataSource([EventType, Teacher, Student, User, LevelType, StudentClass, Class, EventNote, Event, EventGift, Gift]);

      this.eventTypeReferenceId = await findOneAndAssignReferenceId(
        dataSource,
        EventType,
        { key: this.eventTypeId, year: this.year },
        null,
        this.eventTypeReferenceId,
        this.eventTypeId,
      );

      this.teacherReferenceId = await findOneAndAssignReferenceId(
        dataSource,
        Teacher,
        { tz: this.teacherTz },
        this.userId,
        this.teacherReferenceId,
        this.teacherTz,
      );

      this.studentReferenceId = await findOneAndAssignReferenceId(
        dataSource,
        Student,
        { tz: this.studentTz },
        this.userId,
        this.studentReferenceId,
        this.studentTz,
      );

      if (this.studentReferenceId && !this.studentClassReferenceId) {
        const studentClassRepository = dataSource.getRepository(StudentClass);

        const studentClass = await studentClassRepository.findOne({
          where: {
            studentReferenceId: this.studentReferenceId,
            year: this.year ?? getCurrentHebrewYear(),
            userId: this.userId
          },
          order: { id: 'ASC' } // Get the first class (oldest entry)
        });

        if (studentClass && studentClass.classReferenceId) {
          this.studentClassReferenceId = studentClass.classReferenceId;
        }
      }

      this.levelTypeReferenceId = await findOneAndAssignReferenceId(
        dataSource,
        LevelType,
        { key: this.levelTypeId, year: this.year },
        this.userId,
        this.levelTypeReferenceId,
        this.levelTypeId,
      );

      this.completedPathReferenceId = await findOneAndAssignReferenceId(
        dataSource,
        LevelType,
        { key: this.completedPathKey, year: this.year },
        this.userId,
        this.completedPathReferenceId,
        this.completedPathKey,
      );

      if (this.eventDate) {
        this.eventHebrewDate = formatHebrewDate(this.eventDate);
        this.eventHebrewMonth = this.eventHebrewDate.split(' ')[1];
      }

      if (this.id && this.newNote) {
        const note = new EventNote();
        note.eventReferenceId = this.id;
        note.noteText = this.newNote;
        const currentUser = getCurrentUser();
        note.userId = currentUser?.id || this.userId;
        const eventNoteRepository = dataSource.getRepository(EventNote);
        await eventNoteRepository.save(note);
      }
    } finally {
      dataSource?.destroy();
    }
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
  @StringType
  @MaxLength(255, { always: true })
  @Column({ length: 255, nullable: true })
  eventHebrewDate: string;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ length: 255, nullable: true })
  eventHebrewMonth: string;

  @IsOptional({ always: true })
  @Column({ default: false })
  completed: boolean;

  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 2 }, { always: true })
  @Min(0, { always: true })
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  grade: number;

  @ValidateIf((event: Event) => !Boolean(event.eventTypeReferenceId), {
    always: true,
  })
  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  eventTypeId: number;

  @ValidateIf((event: Event) => !Boolean(event.eventTypeId) && Boolean(event.eventTypeReferenceId), { always: true })
  @Column({ nullable: true })
  eventTypeReferenceId: number;

  @ValidateIf((event: Event) => !Boolean(event.teacherReferenceId), {
    always: true,
  })
  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  teacherTz: number;

  @ValidateIf((event: Event) => !Boolean(event.teacherTz) && Boolean(event.teacherReferenceId), { always: true })
  @Column({ nullable: true })
  teacherReferenceId: number;

  @ValidateIf((event: Event) => !Boolean(event.studentReferenceId), {
    always: true,
  })
  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  studentTz: number;

  @ValidateIf((event: Event) => !Boolean(event.studentTz) && Boolean(event.studentReferenceId), { always: true })
  @Column({ nullable: true })
  studentReferenceId: number;

  @ValidateIf((event: Event) => !Boolean(event.levelTypeReferenceId), {
    always: true,
  })
  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  levelTypeId: number;

  @ValidateIf((event: Event) => !Boolean(event.levelTypeId) && Boolean(event.levelTypeReferenceId), { always: true })
  @Column({ nullable: true })
  levelTypeReferenceId: number;

  @ValidateIf((event: Event) => !Boolean(event.completedPathReferenceId), {
    always: true,
  })
  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  completedPathKey: number;

  @ValidateIf((event: Event) => !Boolean(event.completedPathKey) && Boolean(event.completedPathReferenceId), {
    always: true,
  })
  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  completedPathReferenceId: number;

  @IsOptional({ always: true })
  @DateType
  @IsDate({ always: true })
  @Column({ nullable: true })
  completionReportDate: Date;

  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  year: number;

  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  studentClassReferenceId: number;

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

  @ManyToOne(() => Student, { nullable: true })
  @JoinColumn({ name: 'studentReferenceId' })
  student: Student;

  @ManyToOne(() => Class, { nullable: true })
  @JoinColumn({ name: 'studentClassReferenceId' })
  studentClass: Class;

  @ManyToOne(() => LevelType, { nullable: true })
  @JoinColumn({ name: 'levelTypeReferenceId' })
  levelType: LevelType;

  @ManyToOne(() => LevelType, { nullable: true })
  @JoinColumn({ name: 'completedPathReferenceId' })
  completedPath: LevelType;

  @ManyToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  user: User;

  @OneToMany(() => EventNote, (note) => note.event, { onDelete: 'CASCADE', cascade: true })
  notes: EventNote[];

  @OneToMany(() => EventGift, (eventGift) => eventGift.event, { onDelete: 'CASCADE', cascade: true })
  eventGifts: EventGift[];

  newNote: string;
}
