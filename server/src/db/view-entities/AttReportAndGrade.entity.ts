import { Column, DataSource, JoinColumn, ManyToOne, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { StudentKlass } from "src/db/entities/StudentKlass.entity";
import { Student } from "../entities/Student.entity";
import { AttReport } from "../entities/AttReport.entity";
import { Grade } from "../entities/Grade.entity";

@ViewEntity("att_report_and_grade", {
    expression: `
  SELECT
      CONCAT('a-', id) AS id,
      'att' as 'type',
      user_id,
      \`year\`,
      studentReferenceId,
      teacherReferenceId,
      lessonReferenceId,
      klassReferenceId,
      report_date,
      how_many_lessons,
      abs_count,
      approved_abs_count,
      NULL AS 'grade',
      NULL AS 'estimation',
      comments,
      sheet_name
  FROM
      att_reports
  UNION
  SELECT
      CONCAT('g-', id) AS id,
      'grade' as 'type',
      user_id,
      \`year\`,
      studentReferenceId,
      teacherReferenceId,
      lessonReferenceId,
      klassReferenceId,
      report_date,
      how_many_lessons,
      NULL AS 'abs_count',
      NULL AS 'approved_abs_count',
      grade,
      estimation,
      comments,
      NULL AS 'sheet_name'
  FROM
      grades
`
})
export class AttReportAndGrade implements IHasUserId {
    @Column()
    id: string;

    @Column()
    type: 'att' | 'grade';

    @Column({ name: "user_id" })
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

    @Column("date", { name: "report_date" })
    reportDate: string;

    @Column({ name: "how_many_lessons", nullable: true })
    howManyLessons: number | null;

    @Column({ name: "abs_count" })
    absCount: number;

    @Column({ name: "approved_abs_count" })
    approvedAbsCount: number;

    @Column({ name: "grade" })
    grade: number;

    @Column({ name: "estimation", nullable: true, length: 500 })
    estimation: string | null;

    @Column("varchar", { name: "comments", nullable: true, length: 500 })
    comments: string | null;

    @Column("varchar", { name: "sheet_name", nullable: true, length: 100 })
    sheetName: string | null;
}
