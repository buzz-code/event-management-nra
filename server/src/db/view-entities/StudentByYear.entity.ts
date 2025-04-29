import { Column, DataSource, JoinColumn, ManyToOne, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { StudentKlass } from "src/db/entities/StudentKlass.entity";
import { Student } from "../entities/Student.entity";
import { Klass } from "../entities/Klass.entity";

@ViewEntity("student_by_year", {
  expression: (dataSource: DataSource) => dataSource
    .createQueryBuilder()
    .select('students.id', 'id')
    .addSelect('students.user_id', 'user_id')
    .addSelect('students.tz', 'tz')
    .addSelect('students.name', 'name')
    .addSelect('GROUP_CONCAT(DISTINCT student_klasses.year)', 'year')
    .addSelect('GROUP_CONCAT(DISTINCT student_klasses.klassReferenceId)', 'klassReferenceIds')
    .addSelect('GROUP_CONCAT(DISTINCT klasses.klassTypeReferenceId)', 'klassTypeReferenceIds')
    .from(StudentKlass, 'student_klasses')
    .leftJoin(Student, 'students', 'students.id = student_klasses.studentReferenceId')
    .leftJoin(Klass, 'klasses', 'klasses.id = student_klasses.klassReferenceId')
    .groupBy('students.id')
})
export class StudentByYear implements IHasUserId {
  @Column()
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column("varchar", { name: "tz", length: 10 })
  tz: string;

  @Column({ name: 'name' })
  name: string;

  @Column('simple-array', { nullable: true })
  year: string[];

  @Column('simple-array', { nullable: true })
  klassReferenceIds: string[];

  @Column('simple-array', { nullable: true })
  klassTypeReferenceIds: string[];

  // @ManyToOne(() => Student, { createForeignKeyConstraints: false })
  // @JoinColumn({ name: 'id' })
  // student: Student;
}
