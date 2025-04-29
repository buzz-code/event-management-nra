import { Column, DataSource, JoinColumn, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Klass } from "src/db/entities/Klass.entity";
import { StudentKlass } from "src/db/entities/StudentKlass.entity";
import { User } from "@shared/entities/User.entity";
import { KlassType, KlassTypeEnum } from "../entities/KlassType.entity";
import { Student } from "../entities/Student.entity";

@ViewEntity("student_klasses_report", {
  expression: (dataSource: DataSource) => dataSource
    .createQueryBuilder()
    .select('students.id', 'id')
    .addSelect('students.tz', 'student_tz')
    .addSelect('students.name', 'student_name')
    .addSelect('student_klasses.user_id', 'user_id')
    .addSelect('student_klasses.year', 'year')

    .addSelect(`GROUP_CONCAT(if(klass_types.klassTypeEnum = '${KlassTypeEnum.baseKlass}', student_klasses.klassReferenceId, null) SEPARATOR ',')`, 'klassReferenceId_1')
    .addSelect(`GROUP_CONCAT(if(klass_types.klassTypeEnum = '${KlassTypeEnum.track}', student_klasses.klassReferenceId, null) SEPARATOR ',')`, 'klassReferenceId_2')
    .addSelect(`GROUP_CONCAT(if(klass_types.klassTypeEnum = '${KlassTypeEnum.speciality}', student_klasses.klassReferenceId, null) SEPARATOR ',')`, 'klassReferenceId_3')
    .addSelect(`GROUP_CONCAT(if(klass_types.klassTypeEnum = '${KlassTypeEnum.other}' || klass_types.klassTypeEnum is null, student_klasses.klassReferenceId, null) SEPARATOR ',')`, 'klassReferenceId_null')

    .addSelect(`GROUP_CONCAT(if(klass_types.klassTypeEnum = '${KlassTypeEnum.baseKlass}', klasses.name, null) SEPARATOR ', ')`, 'klass_name_1')
    .addSelect(`GROUP_CONCAT(if(klass_types.klassTypeEnum = '${KlassTypeEnum.track}', klasses.name, null) SEPARATOR ', ')`, 'klass_name_2')
    .addSelect(`GROUP_CONCAT(if(klass_types.klassTypeEnum = '${KlassTypeEnum.speciality}', klasses.name, null) SEPARATOR ', ')`, 'klass_name_3')
    .addSelect(`GROUP_CONCAT(if(klass_types.klassTypeEnum = '${KlassTypeEnum.other}' || klass_types.klassTypeEnum is null, klasses.name, null) SEPARATOR ', ')`, 'klass_name_null')

    .from(StudentKlass, 'student_klasses')
    .leftJoin(Klass, 'klasses', 'klasses.id = student_klasses.klassReferenceId')
    .leftJoin(KlassType, 'klass_types', 'klass_types.id = klasses.klassTypeReferenceId')
    .leftJoin(Student, 'students', 'students.id = student_klasses.studentReferenceId')
    .groupBy('students.id')
    .addGroupBy('student_klasses.user_id')
    .addGroupBy('student_klasses.year')
})
export class StudentKlassReport implements IHasUserId {
  @Column()
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column({ nullable: true })
  year: number;

  @Column("varchar", { name: "student_tz", length: 10, nullable: true })
  studentTz: string;

  @Column({ name: "id" })
  studentReferenceId: number;

  @Column({ name: "student_name" })
  studentName: string;

  @Column('simple-array', { name: 'klassReferenceId_1' })
  klassReferenceId1: string[];

  @Column('simple-array', { name: 'klassReferenceId_2' })
  klassReferenceId2: string[];

  @Column('simple-array', { name: 'klassReferenceId_3' })
  klassReferenceId3: string[];

  @Column('simple-array', { name: 'klassReferenceId_null' })
  klassReferenceIdNull: string[];

  @Column({ name: 'klass_name_1' })
  klassName1: string;

  @Column({ name: 'klass_name_2' })
  klassName2: string;

  @Column({ name: 'klass_name_3' })
  klassName3: string;

  @Column({ name: 'klass_name_null' })
  klassNameNull: string;

  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;

  @JoinColumn([{ name: "id", referencedColumnName: "id" }])
  student: Student;
}
