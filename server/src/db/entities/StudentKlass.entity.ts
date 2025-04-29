import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DataSource,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { IHasUserId } from "@shared/base-entity/interface";
import { Student } from "./Student.entity";
import { Klass } from "./Klass.entity";
import { User } from "./User.entity";
import { findOneAndAssignReferenceId, getDataSource } from "@shared/utils/entity/foreignKey.util";
import { KlassType } from "./KlassType.entity";
import { Teacher } from "./Teacher.entity";
import { IsOptional, ValidateIf } from "class-validator";
import { CrudValidationGroups } from "@dataui/crud";
import { IsNotEmpty, IsNumber, MaxLength } from "@shared/utils/validation/class-validator-he";
import { fillDefaultYearValue } from "@shared/utils/entity/year.util";
import { MaxCountByUserLimit } from "@shared/utils/validation/max-count-by-user-limit";
import { StudentByYear } from "../view-entities/StudentByYear.entity";
import { PaymentTrack } from "@shared/entities/PaymentTrack.entity";
import { NumberType, StringType } from "@shared/utils/entity/class-transformer";

@Index("student_klasses_users_idx", ["userId"], {})
@Index("student_klasses_user_year_idx", ["userId", "year"], {})
@Index("student_klasses_student_reference_id_year_idx", ["studentReferenceId", "year"], {})
@Index("student_klasses_user_klass_year_idx", ["userId", "klassReferenceId", "year"], {})
@Index("student_klasses_user_student_klass_year_idx", ["userId", "studentReferenceId", "klassReferenceId", "year"], {})
@Index(['studentReferenceId', 'year'])
@Entity("student_klasses")
export class StudentKlass implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    fillDefaultYearValue(this);

    let dataSource: DataSource;
    try {
      dataSource = await getDataSource([Student, Klass, User, KlassType, Teacher]);

      this.studentReferenceId = await findOneAndAssignReferenceId(
        dataSource, Student, { tz: this.studentTz }, this.userId, this.studentReferenceId, this.studentTz
      );
      this.klassReferenceId = await findOneAndAssignReferenceId(
        dataSource, Klass, { year: this.year, key: this.klassId }, this.userId, this.klassReferenceId, this.klassId
      );
    } finally {
      dataSource?.destroy();
    }
  }

  @MaxCountByUserLimit(StudentByYear, (userId, dataSource: DataSource) =>
    dataSource.getRepository(User).findOne({ where: { id: userId }, select: { paymentTrackId: true } })
      .then(user => user?.paymentTrackId)
      .then(ptid => ptid
        ? dataSource.getRepository(PaymentTrack).findOne({ where: { id: ptid }, select: { studentNumberLimit: true } })
        : dataSource.getRepository(PaymentTrack).find({ order: { studentNumberLimit: 'asc' }, take: 1, select: { studentNumberLimit: true } }).then(res => res[0])
      )
      .then(pt => pt?.studentNumberLimit ?? 0)
    , [User, PaymentTrack], 'studentReferenceId', { always: true, message: 'הגעת להגבלת הכמות לטבלת שיוך תלמידות, אנא פני לאחראית כדי להגדיל את החבילה' })
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  year: number;

  @ValidateIf((attReport: StudentKlass) => !Boolean(attReport.studentReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @MaxLength(10, { always: true })
  @StringType
  @Column("varchar", { name: "student_tz", length: 10, nullable: true })
  studentTz: string;

  @ValidateIf((attReport: StudentKlass) => !Boolean(attReport.studentTz) && Boolean(attReport.studentReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  studentReferenceId: number;

  @ValidateIf((attReport: StudentKlass) => !Boolean(attReport.klassReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column("int", { name: "klass_id", nullable: true })
  klassId: number;

  @ValidateIf((attReport: StudentKlass) => !Boolean(attReport.klassId) && Boolean(attReport.klassReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  klassReferenceId: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Student, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'studentReferenceId' })
  student: Student;

  @ManyToOne(() => Klass, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'klassReferenceId' })
  klass: Klass;
}
