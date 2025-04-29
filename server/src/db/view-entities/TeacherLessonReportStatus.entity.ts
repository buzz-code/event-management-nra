import { Column, DataSource, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Teacher } from "../entities/Teacher.entity";
import { ReportMonth } from "../entities/ReportMonth.entity";
import { Lesson } from "../entities/Lesson.entity";
import { AttReportWithReportMonth } from "./AttReportWithReportMonth.entity";

@ViewEntity("teacher_lesson_report_status", {
  expression: (dataSource: DataSource) => dataSource
    .createQueryBuilder()
    .select('teachers.user_id', 'userId')
    .addSelect('teachers.id', 'teacherId')
    .addSelect('lessons.id', 'lessonId')
    .addSelect('lessons.name', 'lessonName')
    .addSelect('lessons.year', 'year')
    .addSelect('report_months.id', 'reportMonthId')
    .addSelect('CASE WHEN COUNT(att_reports.id) > 0 THEN 1 ELSE 0 END', 'isReported')
    .from(Teacher, 'teachers')
    .innerJoin(Lesson, 'lessons', 'lessons.teacherReferenceId = teachers.id')
    .leftJoin(ReportMonth, 'report_months', 'report_months.userId = teachers.user_id AND report_months.year = lessons.year')
    .leftJoin(AttReportWithReportMonth, 'att_reports', 'att_reports.teacherReferenceId = teachers.id AND att_reports.lessonReferenceId = lessons.id AND att_reports.reportMonthReferenceId = report_months.id')
    .where('COALESCE(lessons.start_date, report_months.endDate) <= report_months.endDate'
      + ' AND COALESCE(lessons.end_date, report_months.startDate) >= report_months.startDate')
    .groupBy('teachers.id')
    .addGroupBy('lessons.id')
    .addGroupBy('report_months.id')
    .orderBy('report_months.id')
})
export class TeacherLessonReportStatus implements IHasUserId {
  @Column()
  userId: number;

  @Column()
  year: number;

  @Column()
  teacherId: number;

  @Column()
  lessonId: number;

  @Column()
  lessonName: string;

  @Column()
  reportMonthId: number;

  @Column()
  isReported: boolean;
}
