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
} from "typeorm";
import { User } from "./User.entity";
import { Event } from "./Event.entity";
import { IsOptional, ValidateIf } from "class-validator";
import { CrudValidationGroups } from "@dataui/crud";
import { IsNotEmpty, MaxLength, IsNumber } from "@shared/utils/validation/class-validator-he";
import { StringType, NumberType } from "@shared/utils/entity/class-transformer";
import { IHasUserId } from "@shared/base-entity/interface";

@Entity("teachers")
@Index("teachers_user_id_idx", ["userId"], {})
@Index("teachers_name_idx", ["first_name", "last_name"], {})
export class Teacher implements IHasUserId {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("int", { name: "user_id", nullable: true })
  userId: number;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(9, { always: true })
  @Column({ length: 9, nullable: true })
  tz: string;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ name: "first_name", length: 255 })
  first_name: string;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ name: "last_name", length: 255 })
  last_name: string;

  @CreateDateColumn({ name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updated_at: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "userReferenceId" })
  user: User;

  @OneToMany(() => Event, event => event.teacher)
  events: Event[];
}
