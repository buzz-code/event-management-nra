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
import { User } from "src/db/entities/User.entity";
import { findOneAndAssignReferenceId, getDataSource } from "@shared/utils/entity/foreignKey.util";
import { Student } from "./Student.entity";
import { IsOptional, ValidateIf } from "class-validator";
import { CrudValidationGroups } from "@dataui/crud";
import { IsDate, IsNotEmpty, IsNumber, MaxLength } from "@shared/utils/validation/class-validator-he";
import { fillDefaultYearValue } from "@shared/utils/entity/year.util";
import { fillDefaultReportDateValue } from "@shared/utils/entity/deafultValues.util";
import { Klass } from "./Klass.entity";
import { Lesson } from "./Lesson.entity";
import { KlassType } from "./KlassType.entity";
import { Teacher } from "./Teacher.entity";
import { DateType, NumberType, StringType } from "@shared/utils/entity/class-transformer";
import { LessonKlassName } from "../view-entities/LessonKlassName.entity";

@Index("known_users_idx", ["userId"], {})
@Index(['studentReferenceId', 'year'])
@Entity("known_absences")
export class KnownAbsence implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    fillDefaultYearValue(this);
    fillDefaultReportDateValue(this);

    let dataSource: DataSource;
    try {
      dataSource = await getDataSource([Student, User, Klass, KlassType, Lesson, Teacher, LessonKlassName]);

      this.studentReferenceId = await findOneAndAssignReferenceId(
        dataSource, Student, { tz: this.studentTz }, this.userId, this.studentReferenceId, this.studentTz
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

  @ValidateIf((attReport: KnownAbsence) => !Boolean(attReport.studentReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column("varchar", { name: "student_tz", length: 10, nullable: true })
  studentTz: string;

  @ValidateIf((attReport: KnownAbsence) => !Boolean(attReport.studentTz) && Boolean(attReport.studentReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  @Index("known_absences_student_reference_id_idx")
  studentReferenceId: number;

  @ValidateIf((attReport: KnownAbsence) => !Boolean(attReport.klassReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column("int", { name: "klass_id", nullable: true })
  klassId: number | null;

  @ValidateIf((attReport: KnownAbsence) => !Boolean(attReport.klassId) && Boolean(attReport.klassReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  klassReferenceId: number;

  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column("int", { name: "lesson_id", nullable: true })
  lessonId: number;

  @IsOptional({ always: true })
  @Column({ nullable: true })
  lessonReferenceId: number;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @Column("date", { name: "report_date" })
  @DateType
  @IsDate({ always: true })
  reportDate: Date;

  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column("int", { name: "absnce_count", nullable: true })
  absnceCount: number | null;

  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column("int", { name: "absnce_code", nullable: true })
  absnceCode: number | null;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(100, { always: true })
  @Column("varchar", { name: "sender_name", nullable: true, length: 100 })
  senderName: string | null;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(500, { always: true })
  @Column("varchar", { name: "reason", nullable: true, length: 500 })
  reason: string | null;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(500, { always: true })
  @Column("varchar", { name: "comment", nullable: true, length: 500 })
  comment: string | null;

  @IsOptional({ always: true })
  @Column({ default: true })
  isApproved: boolean;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.knownAbsences, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;

  @ManyToOne(() => Student, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'studentReferenceId' })
  student: Student;

  @ManyToOne(() => Lesson, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'lessonReferenceId' })
  lesson: Lesson;

  @ManyToOne(() => Klass, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'klassReferenceId' })
  klass: Klass;
}
