import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Event } from './Event.entity';
import { User } from './User.entity';
import { IsOptional, ValidateIf } from 'class-validator';
import { CrudValidationGroups } from '@dataui/crud';
import { IsNotEmpty, MaxLength, IsNumber } from '@shared/utils/validation/class-validator-he';
import { StringType, NumberType } from '@shared/utils/entity/class-transformer';
import { IHasUserId } from '@shared/base-entity/interface';

@Entity('event_notes')
@Index('event_notes_event_id_idx', ['eventReferenceId'], {})
@Index('event_notes_author_id_idx', ['authorReferenceId'], {})
@Index('event_notes_user_id_idx', ['userId'], {})
export class EventNote implements IHasUserId {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("int", { name: "user_id" })
  userId: number;

  @IsNotEmpty({ always: true })
  @NumberType
  @Column({ nullable: false })
  eventReferenceId: number;

  @IsNotEmpty({ always: true })
  @NumberType
  @Column({ nullable: true })
  authorReferenceId: number;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @StringType
  @MaxLength(2000, { always: true })
  @Column({ type: 'text' })
  noteText: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Event, event => event.notes, { nullable: false })
  @JoinColumn({ name: 'eventReferenceId' })
  event: Event;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'authorReferenceId' })
  author: User;
}