import { Column, DataSource, JoinColumn, ManyToOne, ViewEntity } from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Klass } from "src/db/entities/Klass.entity";
import { StudentKlass } from "src/db/entities/StudentKlass.entity";
import { Student } from "../entities/Student.entity";
import { KlassType, KlassTypeEnum } from "../entities/KlassType.entity";

@ViewEntity("student_base_klass", {
  expression: (dataSource: DataSource) => dataSource
    .createQueryBuilder()
    .select('studentReferenceId', 'id')
    .addSelect('student_klasses.user_id', 'user_id')
    .addSelect('student_klasses.year', 'year')
    .addSelect(`GROUP_CONCAT(DISTINCT if(klass_types.klassTypeEnum = '${KlassTypeEnum.baseKlass}', klasses.name, null) SEPARATOR ', ')`, 'base_klass')
    .from(StudentKlass, 'student_klasses')
    .leftJoin(Klass, 'klasses', 'klasses.id = student_klasses.klassReferenceId')
    .leftJoin(KlassType, 'klass_types', 'klass_types.id = klasses.klassTypeReferenceId')
    .groupBy('studentReferenceId')
    .addGroupBy('user_id')
    .addGroupBy('year')
})
export class StudentBaseKlass implements IHasUserId {
  @Column()
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column({ nullable: true })
  year: number;

  @Column({ name: "base_klass" })
  klassName: string;

  @ManyToOne(() => Student, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'id' })
  student: Student;
}
