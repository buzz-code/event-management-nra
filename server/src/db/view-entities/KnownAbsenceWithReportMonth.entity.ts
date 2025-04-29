import { Column, DataSource, JoinColumn, ManyToOne, PrimaryColumn, ViewColumn, ViewEntity } from "typeorm";
import { ReportMonth } from "../entities/ReportMonth.entity";
import { KnownAbsence } from "../entities/KnownAbsence.entity";

@ViewEntity("known_absence_with_report_month", {
  expression: (dataSource: DataSource) => dataSource
    .createQueryBuilder()
    .select('known_absences.*')
    .addSelect('report_months.id', 'reportMonthReferenceId')
    .from(KnownAbsence, 'known_absences')
    .leftJoin(ReportMonth, 'report_months', 'known_absences.user_id = report_months.userId AND known_absences.report_date <= report_months.endDate AND known_absences.report_date >= report_months.startDate')
})
export class KnownAbsenceWithReportMonth extends KnownAbsence {
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
