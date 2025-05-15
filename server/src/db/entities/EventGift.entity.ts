import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  BeforeInsert,
  BeforeUpdate,
  DataSource,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Event } from './Event.entity';
import { Gift } from './Gift.entity';
import { IsOptional, ValidateIf } from 'class-validator';
import { CrudValidationGroups } from '@dataui/crud';
import { IsNotEmpty, IsNumber } from '@shared/utils/validation/class-validator-he';
import { NumberType } from '@shared/utils/entity/class-transformer';
import { getDataSource, findOneAndAssignReferenceId } from '@shared/utils/entity/foreignKey.util';
import { IHasUserId } from '@shared/base-entity/interface';
import { User } from '@shared/entities/User.entity';
import { fillDefaultYearValue } from '@shared/utils/entity/year.util';

@Entity('event_gifts')
@Unique(['eventReferenceId', 'giftReferenceId'])
@Index('event_gifts_event_id_idx', ['eventReferenceId'], {})
@Index('event_gifts_gift_id_idx', ['giftReferenceId'], {})
@Index('event_gifts_user_id_idx', ['userId'], {})
export class EventGift implements IHasUserId {
  @BeforeInsert()
  @BeforeUpdate()
  async fillFields() {
    fillDefaultYearValue(this);

    let dataSource: DataSource;
    try {
      dataSource = await getDataSource([Gift]);

      this.giftReferenceId = await findOneAndAssignReferenceId(
        dataSource,
        Gift,
        { key: this.giftKey, year: this.year },
        this.userId,
        this.giftReferenceId,
        this.giftKey,
      );
    } finally {
      dataSource?.destroy();
    }
  }

  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @IsNotEmpty({ always: true })
  @Column({ nullable: false })
  eventReferenceId: number;

  @ValidateIf((eventGift: EventGift) => !Boolean(eventGift.giftReferenceId), {
    always: true,
  })
  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @NumberType
  @IsNumber({ maxDecimalPlaces: 0 }, { always: true })
  @Column({ nullable: true })
  giftKey: number;

  @ValidateIf((eventGift: EventGift) => !Boolean(eventGift.giftKey) && Boolean(eventGift.giftReferenceId), {
    always: true,
  })
  @Column({ nullable: false })
  giftReferenceId: number;

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

  @ManyToOne(() => Gift, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'giftReferenceId' })
  gift: Gift;
}
