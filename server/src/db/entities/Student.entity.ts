import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
  DataSource,
  Unique,
} from 'typeorm';
import { IsOptional, ValidateIf } from 'class-validator';
import { CrudValidationGroups } from '@dataui/crud';
import { IsNotEmpty, IsUniqueCombination, MaxLength, IsNumber } from '@shared/utils/validation/class-validator-he';
import { StringType, NumberType } from '@shared/utils/entity/class-transformer';
import { IHasUserId } from '@shared/base-entity/interface';
import { findOneAndAssignReferenceId, getDataSource } from '@shared/utils/entity/foreignKey.util';
import { FamilyStatusType } from './FamilyStatusType.entity';

@Entity('students')
@Index('students_user_id_idx', ['userId'], {})
@Index('students_name_idx', ['name'], {})
@Index('students_tz_idx', ['tz'], {})
@Unique(['userId', 'tz'])
export class Student implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    let dataSource: DataSource;
    try {
      dataSource = await getDataSource([FamilyStatusType, Student]);

      this.familyStatusReferenceId = await findOneAndAssignReferenceId(
        dataSource,
        FamilyStatusType,
        { key: this.familyStatusKey },
        this.userId,
        this.familyStatusReferenceId,
        this.familyStatusKey,
      );
    } finally {
      dataSource?.destroy();
    }
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @StringType
  @MaxLength(255, { always: true })
  @IsUniqueCombination(['userId'], [Student], { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @Column()
  tz: string;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @StringType
  @MaxLength(510, { always: true })
  @Column({ length: 510 })
  name: string;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(1000, { always: true })
  @Column({ type: 'text', nullable: true })
  address: string;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ length: 255, nullable: true })
  motherName: string;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ length: 255, nullable: true })
  motherContact: string;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ length: 255, nullable: true })
  fatherName: string;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ length: 255, nullable: true })
  fatherContact: string;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ length: 255, nullable: true })
  motherPreviousName: string;

  @ValidateIf((student: Student) => !Boolean(student.familyStatusReferenceId), {
    always: true,
  })
  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  familyStatusKey: number;

  @ValidateIf((student: Student) => !Boolean(student.familyStatusKey) && Boolean(student.familyStatusReferenceId), { always: true })
  @Column('int', { name: 'family_status_reference_id', nullable: true })
  familyStatusReferenceId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
