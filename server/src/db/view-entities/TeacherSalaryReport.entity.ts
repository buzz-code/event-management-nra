import { Column, DataSource, JoinColumn, ManyToOne, PrimaryColumn, ViewColumn, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { ReportMonth } from "../entities/ReportMonth.entity";
import { Teacher } from "../entities/Teacher.entity";
import { Lesson } from "../entities/Lesson.entity";
import { Klass } from "../entities/Klass.entity";
import { AttReportWithReportMonth } from "./AttReportWithReportMonth.entity";

@ViewEntity("teacher_salary_report", {
  expression: (dataSource: DataSource) => dataSource
    .createQueryBuilder()
    .select('CONCAT(COALESCE(att_reports.user_id, "null"), "_", COALESCE(att_reports.teacherReferenceId, "null"), "_", ' +
      'COALESCE(att_reports.lessonReferenceId, "null"), "_", COALESCE(att_reports.klassReferenceId, "null"), "_", ' +
      'COALESCE(att_reports.how_many_lessons, "null"), "_", COALESCE(att_reports.year, "null"), "_", ' +
      'COALESCE(att_reports.reportMonthReferenceId, "null"))', 'id')
    .addSelect('att_reports.user_id', 'userId')
    .addSelect('att_reports.teacherReferenceId', 'teacherReferenceId')
    .addSelect('att_reports.lessonReferenceId', 'lessonReferenceId')
    .addSelect('att_reports.klassReferenceId', 'klassReferenceId')
    .addSelect('att_reports.how_many_lessons', 'how_many_lessons')
    .addSelect('att_reports.year', 'year')
    .addSelect('att_reports.reportMonthReferenceId', 'reportMonthReferenceId')
    .distinct(true)
    .from(AttReportWithReportMonth, 'att_reports')
})
export class TeacherSalaryReport implements IHasUserId {
  @ViewColumn()
  @PrimaryColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  teacherReferenceId: number;

  @Column()
  lessonReferenceId: number;

  @Column()
  klassReferenceId: number;

  @Column({ name: 'how_many_lessons' })
  howManyLessons: number;

  @Column()
  year: number;

  @Column()
  reportMonthReferenceId: number;

  @ManyToOne(() => Teacher, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'teacherReferenceId' })
  teacher: Teacher;

  @ManyToOne(() => Lesson, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'lessonReferenceId' })
  lesson: Lesson;

  @ManyToOne(() => Klass, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'klassReferenceId' })
  klass: Klass;

  @ManyToOne(() => ReportMonth, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'reportMonthReferenceId' })
  reportMonth: ReportMonth;
}
