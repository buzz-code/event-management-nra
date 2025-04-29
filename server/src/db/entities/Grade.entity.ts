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
import { Klass } from "./Klass.entity";
import { Lesson } from "./Lesson.entity";
import { Teacher } from "./Teacher.entity";
import { KlassType } from "./KlassType.entity";
import { fillDefaultYearValue } from "@shared/utils/entity/year.util";
import { fillDefaultReportDateValue } from "@shared/utils/entity/deafultValues.util";
import { IsOptional, ValidateIf } from "class-validator";
import { IsDate, IsNotEmpty, IsNumber, MaxLength } from "@shared/utils/validation/class-validator-he";
import { CrudValidationGroups } from "@dataui/crud";
import { StudentBaseKlass } from "../view-entities/StudentBaseKlass.entity";
import { DateType, NumberType, StringType } from "@shared/utils/entity/class-transformer";
import { LessonKlassName } from "../view-entities/LessonKlassName.entity";

@Index("grades_users_idx", ["userId"], {})
@Index("grades_user_lesson_klass_year_idx", ["userId", "lessonReferenceId", "klassReferenceId", "year"], {})
@Entity("grades")
export class Grade implements IHasUserId {
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

  @ValidateIf((grade: Grade) => !Boolean(grade.studentReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column("varchar", { name: "student_tz", length: 10, nullable: true })
  studentTz: string;

  @ValidateIf((grade: Grade) => !Boolean(grade.studentTz) && Boolean(grade.studentReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  @Index("grades_student_reference_id_idx")
  studentReferenceId: number;

  @ValidateIf((grade: Grade) => !Boolean(grade.teacherReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column("varchar", { name: "teacher_id", length: 10, nullable: true })
  teacherId: string;

  @ValidateIf((grade: Grade) => !Boolean(grade.teacherId) && Boolean(grade.teacherReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  @Index("grades_teacher_reference_id_idx")
  teacherReferenceId: number;

  @ValidateIf((grade: Grade) => !Boolean(grade.klassReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column("int", { name: "klass_id", nullable: true })
  klassId: number | null;

  @ValidateIf((grade: Grade) => !Boolean(grade.klassId) && Boolean(grade.klassReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  @Index("grades_klass_reference_id_idx")
  klassReferenceId: number;

  @ValidateIf((grade: Grade) => !Boolean(grade.lessonReferenceId), { always: true })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column("int", { name: "lesson_id", nullable: true })
  lessonId: number;

  @ValidateIf((grade: Grade) => !Boolean(grade.lessonId) && Boolean(grade.lessonReferenceId), { always: true })
  @Column({ nullable: true })
  @Index("grades_lesson_reference_id_idx")
  lessonReferenceId: number;

  @Column("date", { name: "report_date" })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @DateType
  @IsDate({ always: true })
  @Index("grades_report_date_idx")
  reportDate: Date;

  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 1 }, { always: true })
  @Column("float", { name: "how_many_lessons", nullable: true })
  howManyLessons: number | null;

  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 1 }, { always: true })
  @Column("float", { name: "grade", default: () => "'0'" })
  grade: number;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(500, { always: true })
  @Column("varchar", { name: "estimation", nullable: true, length: 500 })
  estimation: string | null;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(500, { always: true })
  @Column("varchar", { name: "comments", nullable: true, length: 500 })
  comments: string | null;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.grades, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;

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
