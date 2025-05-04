// filepath: /root/code-server/config/workspace/event-management-nra/server/src/db/entities/CoursePath.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index
} from "typeorm";
import { Event } from "./Event.entity";
import { CrudValidationGroups } from "@dataui/crud";
import { IsNotEmpty, MaxLength, IsNumber } from "@shared/utils/validation/class-validator-he";
import { StringType, NumberType } from "@shared/utils/entity/class-transformer";
import { IsOptional } from "class-validator";
import { IHasUserId } from "@shared/base-entity/interface";

@Entity("course_paths")
@Index("course_paths_user_id_idx", ["userId"], {})
export class CoursePath implements IHasUserId {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ length: 255 })
  name: string;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @IsNumber({}, { always: true })
  @Column("int", { name: "key" })
  key: number;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(1000, { always: true })
  @Column({ type: "text", nullable: true })
  description: string;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;

  @OneToMany(() => Event, event => event.coursePath)
  events: Event[];
}