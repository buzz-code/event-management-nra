import { Column, DataSource, JoinColumn, ManyToOne, PrimaryColumn, ViewColumn, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Student } from "../entities/Student.entity";
import { AttReportAndGrade } from "./AttReportAndGrade.entity";
import { Teacher } from "../entities/Teacher.entity";
import { Lesson } from "../entities/Lesson.entity";
import { Klass } from "../entities/Klass.entity";
import { KlassType, KlassTypeEnum } from "../entities/KlassType.entity";

@ViewEntity("student_global_report", {
  expression: (dataSource: DataSource) => dataSource
    .createQueryBuilder()
    .select('CONCAT(COALESCE(studentReferenceId, "null"), "_", COALESCE(atag.teacherReferenceId, "null"), "_", ' +
      'COALESCE(klassReferenceId, "null"), "_", COALESCE(lessonReferenceId, "null"), "_", ' +
      'COALESCE(atag.user_id, "null"), "_", COALESCE(atag.year, "null"))', 'id')
    .addSelect('atag.user_id', 'user_id')
    .addSelect('atag.year', 'year')
    .addSelect('studentReferenceId')
    .addSelect('atag.teacherReferenceId', 'teacherReferenceId')
    .addSelect('klassReferenceId')
    .addSelect('lessonReferenceId')
    .addSelect(`CASE WHEN klass_types.klassTypeEnum = "${KlassTypeEnum.baseKlass}" THEN 1 ELSE 0 END`, 'isBaseKlass')
    .addSelect('SUM(how_many_lessons)', 'lessons_count')
    .addSelect('SUM(abs_count)', 'abs_count')
    .addSelect('AVG(grade)', 'grade_avg')
    .from(AttReportAndGrade, 'atag')
    .leftJoin(Klass, 'klasses', 'klasses.id = atag.klassReferenceId')
    .leftJoin(KlassType, 'klass_types', 'klass_types.id = klasses.klassTypeReferenceId')
    .groupBy('studentReferenceId')
    .addGroupBy('atag.teacherReferenceId')
    .addGroupBy('klassReferenceId')
    .addGroupBy('lessonReferenceId')
    .addGroupBy('atag.user_id')
    .addGroupBy('atag.year')
})
export class StudentGlobalReport implements IHasUserId {
  @ViewColumn()
  @PrimaryColumn()
  id: string;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column({ nullable: true })
  year: number;

  @Column()
  studentReferenceId: number;

  @Column()
  klassReferenceId: number;

  @Column()
  lessonReferenceId: number;

  @Column()
  teacherReferenceId: number;

  @Column()
  isBaseKlass: boolean;

  @Column({ name: 'lessons_count' })
  lessonsCount: number;

  @Column({ name: 'abs_count' })
  absCount: number;

  @Column({ name: 'grade_avg' })
  gradeAvg: number;

  @ManyToOne(() => Student, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'studentReferenceId' })
  student: Student;

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
