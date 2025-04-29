import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index, BeforeInsert, BeforeUpdate, DataSource } from 'typeorm';
import { Event } from './Event.entity';
import { User } from './User.entity';
import { IsOptional, ValidateIf } from 'class-validator';
import { CrudValidationGroups } from '@dataui/crud';
import { IsNotEmpty, MaxLength, IsNumber } from '@shared/utils/validation/class-validator-he';
import { StringType, NumberType } from '@shared/utils/entity/class-transformer';
import { getDataSource, findOneAndAssignReferenceId } from '@shared/utils/entity/foreignKey.util';

@Entity('event_notes')
@Index('event_notes_event_id_idx', ['eventReferenceId'], {})
@Index('event_notes_author_id_idx', ['authorReferenceId'], {})
export class EventNote {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    let dataSource: DataSource;
    try {
      dataSource = await getDataSource([Event, User]);

      this.eventReferenceId = await findOneAndAssignReferenceId(
        dataSource, Event, { id: this.eventId }, null, this.eventReferenceId, this.eventId
      );
      
      this.authorReferenceId = await findOneAndAssignReferenceId(
        dataSource, User, { id: this.authorId }, null, this.authorReferenceId, this.authorId
      );
    } finally {
      dataSource?.destroy();
    }
  }

  @PrimaryGeneratedColumn()
  id: number;

  @ValidateIf((note: EventNote) => !Boolean(note.eventReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  eventId: number;

  @ValidateIf((note: EventNote) => !Boolean(note.eventId) && Boolean(note.eventReferenceId), { always: true })
  @Column({ nullable: false })
  eventReferenceId: number;

  @ValidateIf((note: EventNote) => !Boolean(note.authorReferenceId), { always: true })
  @IsOptional({ always: true })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  authorId: number;

  @ValidateIf((note: EventNote) => !Boolean(note.authorId) && Boolean(note.authorReferenceId), { always: true })
  @Column({ nullable: true })
  authorReferenceId: number;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @StringType
  @MaxLength(2000, { always: true })
  @Column({ type: 'text' })
  note_text: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Event, event => event.notes, { nullable: false })
  @JoinColumn({ name: 'eventReferenceId' })
  event: Event;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'authorReferenceId' })
  author: User;
}