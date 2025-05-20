import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { Event } from './Event.entity';
import { User } from './User.entity';
import { IsOptional, IsNumber } from 'class-validator';
import { CrudValidationGroups } from '@dataui/crud';
import { IsNotEmpty, MaxLength } from '@shared/utils/validation/class-validator-he';
import { StringType, NumberType } from '@shared/utils/entity/class-transformer';
import { IHasUserId } from '@shared/base-entity/interface';
import { fillDefaultYearValue } from '@shared/utils/entity/year.util';
import { getCurrentUser } from '@shared/utils/validation/current-user.util';

@Entity('event_notes')
@Index('event_notes_event_id_idx', ['eventReferenceId'], {})
@Index('event_notes_author_id_idx', ['authorReferenceId'], {})
@Index('event_notes_user_id_idx', ['userId'], {})
export class EventNote implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  fillFields() {
    fillDefaultYearValue(this);

    if (!this.authorReferenceId) {
      const user = getCurrentUser();
      if (user.id !== -1) {
        this.authorReferenceId = user.id;
      }
    }
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @NumberType
  @Column({ nullable: false })
  eventReferenceId: number;

  @IsOptional({ always: true })
  @NumberType
  @Column({ nullable: true })
  authorReferenceId: number;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @StringType
  @MaxLength(2000, { always: true })
  @Column({ type: 'text' })
  noteText: string;

  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  year: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Event, (event) => event.eventGifts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'eventReferenceId' })
  event: Event;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'authorReferenceId' })
  author: User;
}
