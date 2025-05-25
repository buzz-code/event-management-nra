import { DeepPartial } from 'typeorm';
import { CrudRequest } from '@dataui/crud';
import { CrudAuthCustomFilter, getUserIdFilter } from '@shared/auth/crud-auth.filter';
import { BaseEntityModuleOptions, Entity } from '@shared/base-entity/interface';
import { BaseEntityService } from '@shared/base-entity/base-entity.service';
import { IHeader } from '@shared/utils/exporter/types';
import { Event } from 'src/db/entities/Event.entity';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: Event,
    crudAuth: CrudAuthCustomFilter((user) => {
      const userFilter: DeepPartial<Event> = getUserIdFilter(user);
      if (user.permissions?.teacher) {
        userFilter['teacher.ownUserId'] = user.id;
      }
      return userFilter;
    }),
    query: {
      join: {
        eventType: { eager: false },
        teacher: { eager: true },
        student: { eager: false },
        studentClass: { eager: false },
        levelType: { eager: false },
        notes: { eager: false },
        eventGifts: { eager: false },
      },
    },
    exporter: {
      processReqForExport(req: CrudRequest, innerFunc) {
        req.options.query.join = {
          eventType: { eager: true },
          teacher: { eager: true },
          student: { eager: true },
          studentClass: { eager: true },
          levelType: { eager: true },
        };
        return innerFunc(req);
      },
      getExportHeaders(): IHeader[] {
        return [
          { value: 'name', label: 'כותרת' },
          { value: 'description', label: 'תיאור' },
          { value: 'eventDate', label: 'תאריך אירוע' },
          { value: 'eventHebrewDate', label: 'תאריך עברי' },
          { value: 'eventHebrewMonth', label: 'חודש עברי' },
          { value: 'completed', label: 'הושלם' },
          { value: 'grade', label: 'ציון' },
          { value: 'eventType.name', label: 'סוג אירוע' },
          { value: 'teacher.name', label: 'שם מורה' },
          { value: 'student.name', label: 'שם תלמיד' },
          { value: 'studentClass.name', label: 'שם כיתה' },
          { value: 'levelType.name', label: 'סוג רמה' },
          { value: 'year', label: 'שנה' },
        ];
      },
    },
    service: EventService,
  };
}

class EventService<T extends Entity | Event> extends BaseEntityService<T> {
  async doAction(req: CrudRequest<any, any>, body: any): Promise<any> {
    switch (req.parsed.extra.action) {
      case 'teacherAssociation': {
        const teacherIds = req.parsed.extra.teacherReferenceIds?.toString()?.split(',') || [];
        const eventIds = req.parsed.extra.ids?.toString()?.split(',') || [];
        for (const eventId of eventIds) {
          const event = await this.dataSource.getRepository(Event).findOneBy({ id: parseInt(eventId) });
          if (event) {
            const randomTeacherId = teacherIds[Math.floor(Math.random() * teacherIds.length)];
            event.teacherReferenceId = parseInt(randomTeacherId);
            await this.dataSource.getRepository(Event).save(event);
          }
        }
        return 'האירועים עודכנו בהצלחה';
      }
    }
    return super.doAction(req, body);
  }
}

export default getConfig();
