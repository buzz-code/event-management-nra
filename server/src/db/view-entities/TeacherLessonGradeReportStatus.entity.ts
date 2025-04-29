import { Column, DataSource, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Teacher } from "../entities/Teacher.entity";
import { ReportMonth } from "../entities/ReportMonth.entity";
import { Lesson } from "../entities/Lesson.entity";
import { GradeWithReportMonth } from "./GradeWithReportMonth.entity";

@ViewEntity("teacher_lesson_grade_report_status", {
  expression: (dataSource: DataSource) => dataSource
    .createQueryBuilder()
    .select('teachers.user_id', 'userId')
    .addSelect('teachers.id', 'teacherId')
    .addSelect('lessons.id', 'lessonId')
    .addSelect('lessons.name', 'lessonName')
    .addSelect('lessons.year', 'year')
    .addSelect('report_months.id', 'reportMonthId')
    .addSelect('CASE WHEN COUNT(grades.id) > 0 THEN 1 ELSE 0 END', 'isReported')
    .from(Teacher, 'teachers')
    .innerJoin(Lesson, 'lessons', 'lessons.teacherReferenceId = teachers.id')
    .leftJoin(ReportMonth, 'report_months', 'report_months.userId = teachers.user_id')
    .leftJoin(GradeWithReportMonth, 'grades', 'grades.teacherReferenceId = teachers.id AND grades.lessonReferenceId = lessons.id AND grades.reportMonthReferenceId = report_months.id')
    .where('COALESCE(lessons.start_date, report_months.endDate) <= report_months.endDate'
      + ' AND COALESCE(lessons.end_date, report_months.startDate) >= report_months.startDate')
    .groupBy('teachers.id')
    .addGroupBy('lessons.id')
    .addGroupBy('report_months.id')
    .orderBy('report_months.id')
})
export class TeacherLessonGradeReportStatus implements IHasUserId {
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
