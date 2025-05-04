import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
  DataSource
} from "typeorm";
import { Class } from "./Class.entity";
import { Event } from "./Event.entity";
import { IsOptional, ValidateIf } from "class-validator";
import { CrudValidationGroups } from "@dataui/crud";
import { IsNotEmpty, MaxLength, IsNumber } from "@shared/utils/validation/class-validator-he";
import { StringType, NumberType } from "@shared/utils/entity/class-transformer";
import { IHasUserId } from "@shared/base-entity/interface";
import { findOneAndAssignReferenceId, getDataSource } from "@shared/utils/entity/foreignKey.util";

@Entity("students")
@Index("students_user_id_idx", ["userId"], {})
@Index("students_class_id_idx", ["classReferenceId"], {})
@Index("students_name_idx", ["first_name", "last_name"], {})
@Index("students_tz_idx", ["tz"], {})
export class Student implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    let dataSource: DataSource;
    try {
      dataSource = await getDataSource([Class]);

      this.classReferenceId = await findOneAndAssignReferenceId(
        dataSource, Class, { key: this.classKey }, this.userId, this.classReferenceId, this.classKey
      );
    } finally {
      dataSource?.destroy();
    }
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(9, { always: true })
  @Column({ length: 9, nullable: true })
  tz: string;

  @ValidateIf((student: Student) => !Boolean(student.classReferenceId), { always: true })
  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true, name: "class_id" })
  classKey: number;

  @ValidateIf((student: Student) => !Boolean(student.classKey) && Boolean(student.classReferenceId), { always: true })
  @Column({ nullable: true })
  classReferenceId: number;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ length: 255, name: "first_name" })
  first_name: string;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ length: 255, name: "last_name" })
  last_name: string;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(1000, { always: true })
  @Column({ type: "text", nullable: true })
  address: string;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ length: 255, nullable: true, name: "mother_name" })
  mother_name: string;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ length: 255, nullable: true, name: "mother_contact" })
  mother_contact: string;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ length: 255, nullable: true, name: "father_name" })
  father_name: string;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ length: 255, nullable: true, name: "father_contact" })
  father_contact: string;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;

  @ManyToOne(() => Class, cls => cls.students, { nullable: true })
  @JoinColumn({ name: "classReferenceId" })
  class: Class;

  @OneToMany(() => Event, event => event.student)
  events: Event[];
}
