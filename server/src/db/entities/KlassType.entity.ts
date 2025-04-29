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
import { User } from "src/db/entities/User.entity";
import { IsOptional } from "class-validator";
import { CrudValidationGroups } from "@dataui/crud";
import { IsNotEmpty, IsNumber, MaxLength } from "@shared/utils/validation/class-validator-he";
import { findOneAndAssignReferenceId, getDataSource } from "@shared/utils/entity/foreignKey.util";
import { Teacher } from "./Teacher.entity";
import { NumberType, StringType } from "@shared/utils/entity/class-transformer";

export enum KlassTypeEnum {
  baseKlass = 'כיתת אם',
  track = 'מסלול',
  speciality = 'התמחות',
  other = 'אחר',
}

@Index("klass_types_users_idx", ["userId"], {})
@Entity("klass_types")
export class KlassType implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {

    let dataSource: DataSource;
    try {
      dataSource = await getDataSource([Teacher, User]);

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

  @Column('varchar', { default: KlassTypeEnum.other })
  @Index("klass_types_klassTypeEnum_idx")
  klassTypeEnum: KlassTypeEnum;

  @Column("varchar", { name: "teacher_id", length: 10, nullable: true })
  teacherId: string;

  @Column({ nullable: true })
  teacherReferenceId: number;

  @CreateDateColumn({ name: "created_at", type: "timestamp" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at", type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.klassTypes, {
    onDelete: "NO ACTION",
    onUpdate: "NO ACTION",
  })
  @JoinColumn([{ name: "user_id", referencedColumnName: "id" }])
  user: User;
}
