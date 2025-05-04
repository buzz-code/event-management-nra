import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique, BeforeInsert, BeforeUpdate, DataSource, Column, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Event } from './Event.entity';
import { Gift } from './Gift.entity';
import { IsOptional, ValidateIf } from 'class-validator';
import { CrudValidationGroups } from '@dataui/crud';
import { IsNotEmpty, IsNumber } from '@shared/utils/validation/class-validator-he';
import { NumberType } from '@shared/utils/entity/class-transformer';
import { getDataSource, findOneAndAssignReferenceId } from '@shared/utils/entity/foreignKey.util';

@Entity('event_gifts')
@Unique(['eventReferenceId', 'giftReferenceId'])
@Index('event_gifts_event_id_idx', ['eventReferenceId'], {})
@Index('event_gifts_gift_id_idx', ['giftReferenceId'], {})
export class EventGift {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    let dataSource: DataSource;
    try {
      dataSource = await getDataSource([Gift]);

      this.giftReferenceId = await findOneAndAssignReferenceId(
        dataSource, Gift, { key: this.giftKey }, null, this.giftReferenceId, this.giftKey
      );
    } finally {
      dataSource?.destroy();
    }
  }

  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty({ always: true })
  @Column({ nullable: false })
  eventReferenceId: number;

  @ValidateIf((eventGift: EventGift) => !Boolean(eventGift.giftReferenceId), { always: true })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  giftKey: number;

  @ValidateIf((eventGift: EventGift) => !Boolean(eventGift.giftKey) && Boolean(eventGift.giftReferenceId), { always: true })
  @Column({ nullable: false })
  giftReferenceId: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Event, event => event.eventGifts, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventReferenceId' })
  event: Event;

  @ManyToOne(() => Gift, gift => gift.eventGifts, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'giftReferenceId' })
  gift: Gift;
}