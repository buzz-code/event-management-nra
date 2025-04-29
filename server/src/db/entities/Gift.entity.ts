import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { EventGift } from './EventGift.entity';
import { IsOptional } from 'class-validator';
import { CrudValidationGroups } from '@dataui/crud';
import { IsNotEmpty, MaxLength } from '@shared/utils/validation/class-validator-he';
import { StringType } from '@shared/utils/entity/class-transformer';

@Entity('gifts')
export class Gift {
  @PrimaryGeneratedColumn()
  id: number;

  @IsNotEmpty({ groups: [CrudValidationGroups.CREATE] })
  @IsOptional({ groups: [CrudValidationGroups.UPDATE] })
  @StringType
  @MaxLength(255, { always: true })
  @Column({ length: 255 })
  name: string;

  @IsOptional({ always: true })
  @StringType
  @MaxLength(1000, { always: true })
  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => EventGift, eventGift => eventGift.gift)
  eventGifts: EventGift[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}