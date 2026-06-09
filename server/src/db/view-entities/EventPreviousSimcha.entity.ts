import { IHasUserId } from '@shared/base-entity/interface';
import { PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';

@ViewEntity({
  name: 'event_previous_simcha',
  expression: `
    SELECT
      e.id AS id,
      e.user_id AS userId,
      LAG(et.name) OVER (PARTITION BY e.studentReferenceId, e.user_id ORDER BY e.eventDate, e.id) AS previousSimchaDescription,
      LAG(t.name) OVER (PARTITION BY e.studentReferenceId, e.user_id ORDER BY e.eventDate, e.id) AS previousTeacherName,
      LAG(e.eventHebrewDate) OVER (PARTITION BY e.studentReferenceId, e.user_id ORDER BY e.eventDate, e.id) AS previousEventHebrewDate
    FROM events e
    LEFT JOIN event_types et ON et.id = e.eventTypeReferenceId
    LEFT JOIN teachers t ON t.id = e.teacherReferenceId
  `,
})
export class EventPreviousSimcha implements IHasUserId {
  @PrimaryColumn()
  id: number;

  @ViewColumn()
  userId: number;

  @ViewColumn()
  previousSimchaDescription: string;

  @ViewColumn()
  previousTeacherName: string;

  @ViewColumn()
  previousEventHebrewDate: string;
}
