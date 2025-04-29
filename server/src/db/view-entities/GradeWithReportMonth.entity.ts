import { Column, DataSource, JoinColumn, ManyToOne, PrimaryColumn, ViewColumn, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { ReportMonth } from "../entities/ReportMonth.entity";
import { Grade } from "../entities/Grade.entity";

@ViewEntity("grade_with_report_month", {
  expression: (dataSource: DataSource) => dataSource
    .createQueryBuilder()
    .select('grades.*')
    .addSelect('report_months.id', 'reportMonthReferenceId')
    .from(Grade, 'grades')
    .leftJoin(ReportMonth, 'report_months', 'grades.user_id = report_months.userId AND grades.report_date <= report_months.endDate AND grades.report_date >= report_months.startDate')
})
export class GradeWithReportMonth extends Grade implements IHasUserId {
  @ViewColumn()
  @PrimaryColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column()
  reportMonthReferenceId: number;

  @ManyToOne(() => ReportMonth, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'reportMonthReferenceId' })
  reportMonth: ReportMonth;
}
