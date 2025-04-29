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
import { KlassType } from "./KlassType.entity";
import { Teacher } from "./Teacher.entity";
import { User } from "./User.entity";
import { findOneAndAssignReferenceId, getDataSource } from "@shared/utils/entity/foreignKey.util";
import { IsOptional, ValidateIf } from "class-validator";
import { CrudValidationGroups } from "@dataui/crud";
import { IsNotEmpty, IsNumber, IsUniqueCombination, MaxLength } from "@shared/utils/validation/class-validator-he";
import { NumberType, StringType } from "@shared/utils/entity/class-transformer";
import { fillDefaultYearValue } from "@shared/utils/entity/year.util";

@Index("klasses_users_idx", ["userId"], {})
@Index(["userId", "key", "year"], { unique: true })
@Index("klasses_user_id_key_idx", ["userId", "key"])
@Entity("klasses")
export class Klass implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    let dataSource: DataSource;
    try {
      fillDefaultYearValue(this);
      dataSource = await getDataSource([KlassType, Teacher, User]);

      this.klassTypeReferenceId = await findOneAndAssignReferenceId(
        dataSource, KlassType, { key: this.klassTypeId }, this.userId, this.klassTypeReferenceId, this.klassTypeId
      );
      this.teacherReferenceId = await findOneAndAssignReferenceId(
        dataSource, Teacher, { tz: this.teacherId }, this.userId, this.teacherReferenceId, this.teacherId
      );
    } finally {
      dataSource?.destroy();
    }
  }

  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @Column({ nullable: true })
  year: number;

  @IsUniqueCombination(['userId', 'year'], [Klass, KlassType, User, Teacher], { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column("int", { name: "key" })
  key: number;

  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @StringType
  @MaxLength(500, { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column("varchar", { name: "name", length: 500 })
  name: string;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(500, { always: true })
  @Column("varchar", { name: "display_name", length: 500, nullable: true })
  displayName: string;

  @ValidateIf((attReport: Klass) => !Boolean(attReport.klassTypeReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column("int", { name: "klass_type_id", nullable: true })
  klassTypeId: number | null;

  @ValidateIf((attReport: Klass) => !Boolean(attReport.klassTypeId) && Boolean(attReport.klassTypeReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column({ nullable: true })
  @Index("klasses_klass_type_reference_id_idx")
  klassTypeReferenceId: number;

  @Column("varchar", { name: "teacher_id", nullable: true, length: 10 })
  teacherId: string | null;

  @Column({ nullable: true })
  @Index("klasses_teacher_reference_id_idx")
  teacherReferenceId: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => KlassType, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'klassTypeReferenceId' })
  klassType: KlassType;

  @ManyToOne(() => Teacher, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'teacherReferenceId' })
  teacher: Teacher;
}
