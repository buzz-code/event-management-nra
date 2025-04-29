import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DataSource,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Klass } from "./Klass.entity";
import { Lesson } from "./Lesson.entity";
import { Student } from "./Student.entity";
import { Teacher } from "./Teacher.entity";
import { StudentBaseKlass } from "../view-entities/StudentBaseKlass.entity";
import { findOneAndAssignReferenceId, getDataSource } from "@shared/utils/entity/foreignKey.util";
import { User } from "./User.entity";
import { KlassType } from "./KlassType.entity";
import { IsOptional, ValidateIf } from "class-validator";
import { CrudValidationGroups } from "@dataui/crud";
import { IsNotEmpty, IsNumber, MaxLength, IsDate, IsPositive } from "@shared/utils/validation/class-validator-he";
import { fillDefaultYearValue } from "@shared/utils/entity/year.util";
import { fillDefaultReportDateValue } from "@shared/utils/entity/deafultValues.util";
import { DateType, NumberType, StringType } from "@shared/utils/entity/class-transformer";
import { LessonKlassName } from "../view-entities/LessonKlassName.entity";

@Index("att_users_idx", ["userId"], {})
@Index("att_user_sheet_name_lession_klass_year_idx", ["userId", "sheetName", "lessonReferenceId", "klassReferenceId", "year"], {})
@Index("att_user_year_idx", ["userId", "year"], {})
@Index("att_user_year_student_reference_id_idx", ["userId", "studentReferenceId", "year"], {})
@Index("att_user_year_teacher_reference_id_idx", ["userId", "teacherReferenceId", "year"], {})
@Index("att_user_year_lesson_reference_id_idx", ["userId", "lessonReferenceId", "year"], {})
@Entity("att_reports")
export class AttReport implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    fillDefaultYearValue(this);
    fillDefaultReportDateValue(this);

    let dataSource: DataSource;
    try {
      dataSource = await getDataSource([Student, Teacher, Klass, Lesson, User, KlassType, LessonKlassName]);

      this.studentReferenceId = await findOneAndAssignReferenceId(
        dataSource, Student, { tz: this.studentTz }, this.userId, this.studentReferenceId, this.studentTz
      );
      this.teacherReferenceId = await findOneAndAssignReferenceId(
        dataSource, Teacher, { tz: this.teacherId }, this.userId, this.teacherReferenceId, this.teacherId
      );
      this.klassReferenceId = await findOneAndAssignReferenceId(
        dataSource, Klass, { year: this.year, key: this.klassId }, this.userId, this.klassReferenceId, this.klassId
      );
      this.lessonReferenceId = await findOneAndAssignReferenceId(
        dataSource, Lesson, { year: this.year, key: this.lessonId }, this.userId, this.lessonReferenceId, this.lessonId
      );
    } finally {
      dataSource?.destroy();
    }
  }

  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column({ nullable: true })
  year: number;

  @ValidateIf((attReport: AttReport) => !Boolean(attReport.studentReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column("varchar", { name: "student_tz", length: 10, nullable: true })
  studentTz: string;

  @ValidateIf((attReport: AttReport) => !Boolean(attReport.studentTz) && Boolean(attReport.studentReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  @Index("att_reports_student_reference_id_idx")
  studentReferenceId: number;

  @ValidateIf((attReport: AttReport) => !Boolean(attReport.teacherReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column("varchar", { name: "teacher_id", length: 10, nullable: true })
  teacherId: string;

  @ValidateIf((attReport: AttReport) => !Boolean(attReport.teacherId) && Boolean(attReport.teacherReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  @Index("att_reports_teacher_reference_id_idx")
  teacherReferenceId: number;

  @ValidateIf((attReport: AttReport) => !Boolean(attReport.klassReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column("int", { name: "klass_id", nullable: true })
  klassId: number | null;

  @ValidateIf((attReport: AttReport) => !Boolean(attReport.klassId) && Boolean(attReport.klassReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  @Index("att_reports_klass_reference_id_idx")
  klassReferenceId: number;

  @ValidateIf((attReport: AttReport) => !Boolean(attReport.lessonReferenceId), { always: true })
  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column("int", { name: "lesson_id", nullable: true })
  lessonId: number;

  @ValidateIf((attReport: AttReport) => !Boolean(attReport.lessonId) && Boolean(attReport.lessonReferenceId), { always: true })
  @Column({ nullable: true })
  @Index("att_reports_lesson_reference_id_idx")
  lessonReferenceId: number;

  @Column("date", { name: "report_date" })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @DateType
  @IsDate({ always: true })
  @Index("att_reports_report_date_idx")
  reportDate: Date;

  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 1 }, { always: true })
  @IsPositive({ always: true })
  @Column("float", { name: "how_many_lessons", nullable: true })
  howManyLessons: number | null;

  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 1 }, { always: true })
  @Column("float", { name: "abs_count", default: () => "'0'" })
  absCount: number;

  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 1 }, { always: true })
  @Column("float", { name: "approved_abs_count", default: () => "'0'" })
  approvedAbsCount: number;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(500, { always: true })
  @Column("varchar", { name: "comments", nullable: true, length: 500 })
  comments: string | null;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(100, { always: true })
  @Column("varchar", { name: "sheet_name", nullable: true, length: 100 })
  sheetName: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Student, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'studentReferenceId' })
  student: Student;

  @ManyToOne(() => StudentBaseKlass, { createForeignKeyConstraints: false })
  @JoinColumn([{ name: 'studentReferenceId', referencedColumnName: 'id' }, { name: 'year', referencedColumnName: 'year' }])
  studentBaseKlass: StudentBaseKlass;

  @ManyToOne(() => Teacher, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'teacherReferenceId' })
  teacher: Teacher;

  @ManyToOne(() => Lesson, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'lessonReferenceId' })
  lesson: Lesson;

  @ManyToOne(() => Klass, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'klassReferenceId' })
  klass: Klass;
}
