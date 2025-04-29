import { Column, DataSource, JoinColumn, ManyToOne, PrimaryColumn, ViewColumn, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Student } from "../entities/Student.entity";
import { Teacher } from "../entities/Teacher.entity";
import { Lesson } from "../entities/Lesson.entity";
import { Klass } from "../entities/Klass.entity";
import { StudentGlobalReport } from "./StudentGlobalReport.entity";
import { StudentBaseKlass } from "./StudentBaseKlass.entity";

@ViewEntity("student_percent_report", {
  expression: (dataSource: DataSource) => dataSource
    .createQueryBuilder()
    .select('id')
    .addSelect('user_id')
    .addSelect('year')
    .addSelect('studentReferenceId')
    .addSelect('teacherReferenceId')
    .addSelect('klassReferenceId')
    .addSelect('lessonReferenceId')
    .addSelect('lessons_count')
    .addSelect('abs_count')
    .addSelect('COALESCE(abs_count, 0) / GREATEST(COALESCE(lessons_count, 1), 1)', 'abs_percents')
    .addSelect('(1 - COALESCE(abs_count, 0) / GREATEST(COALESCE(lessons_count, 1), 1))', 'att_percents')
    .addSelect('grade_avg / 100', 'grade_avg')
    .from(StudentGlobalReport, 'sgr')
})
export class StudentPercentReport implements IHasUserId {
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

  @Column({ name: 'lessons_count' })
  lessonsCount: number;

  @Column({ name: 'abs_count' })
  absCount: number;

  @Column({ name: 'abs_percents' })
  absPercents: number;

  @Column({ name: 'att_percents' })
  attPercents: number;

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

  @ManyToOne(() => StudentBaseKlass, { createForeignKeyConstraints: false })
  @JoinColumn([{ name: 'studentReferenceId', referencedColumnName: 'id' }, { name: 'year', referencedColumnName: 'year' }])
  studentBaseKlass: StudentBaseKlass;
}
