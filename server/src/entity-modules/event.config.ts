import { DeepPartial, Repository } from 'typeorm';
import { CrudRequest } from '@dataui/crud';
import { CrudAuthCustomFilter, getUserIdFilter } from '@shared/auth/crud-auth.filter';
import { BaseEntityModuleOptions, Entity } from '@shared/base-entity/interface';
import { BaseEntityService } from '@shared/base-entity/base-entity.service';
import { IHeader } from '@shared/utils/exporter/types';
import { Event } from 'src/db/entities/Event.entity';
import { getISODateFormatter } from '@shared/utils/formatting/formatter.util';
import eventExportReport from 'src/reports/eventExport';
import { CommonReportData } from '@shared/utils/report/types';
import { getUserIdFromUser } from '@shared/auth/auth.util';
import { fixReferences } from '@shared/utils/entity/fixReference.util';

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
        reporterStudent: { eager: false },
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
          reporterStudent: { eager: true },
          studentClass: { eager: true },
          levelType: { eager: true },
          notes: { eager: true },
          eventGifts: { eager: true },
        };
        req.options.query.sort = [
          { field: 'student.familyReferenceId', order: 'ASC' },
        ];
        return innerFunc(req);
      },
      getExportHeaders(entityColumns: string[]): IHeader[] {
        return [
          { value: 'student.tz', label: 'תז תלמיד' },
          { value: 'student.name', label: 'שם תלמיד' },
          { value: 'reporterStudent.name', label: 'דווח ע"י' },
          { value: 'eventType.name', label: 'סוג אירוע' },
          { value: 'levelType.name', label: 'רמה' },
          { value: 'teacher.name', label: 'שם מורה' },
          { value: getISODateFormatter('eventDate'), label: 'תאריך אירוע' },
          { value: 'eventHebrewDate', label: 'תאריך עברי', readOnly: true },
          { value: (row: any) => row.notes?.map((note: any) => note.noteText).join(', ') || '', label: 'הערות' },
          { value: (row: any) => row.eventGifts?.map((eg: any) => eg.gift?.name).join(', ') || '', label: 'מתנות' },
          { value: 'year', label: 'שנה' },
          { value: 'studentClass.name', label: 'כיתה' },
          { value: 'completed', label: 'הושלם' },
          { value: 'grade', label: 'ציון' },
          { value: 'fulfillmentQuestion1', label: 'שאלת הגשמה 1' },
          { value: 'fulfillmentQuestion2', label: 'שאלת הגשמה 2' },
          { value: 'fulfillmentQuestion3', label: 'שאלת הגשמה 3' },
          { value: 'fulfillmentQuestion4', label: 'שאלת הגשמה 4' },
          { value: 'fulfillmentQuestion5', label: 'שאלת הגשמה 5' },
          { value: 'fulfillmentQuestion6', label: 'שאלת הגשמה 6' },
          { value: 'fulfillmentQuestion7', label: 'שאלת הגשמה 7' },
          { value: 'fulfillmentQuestion8', label: 'שאלת הגשמה 8' },
          { value: 'lotteryTrack', label: 'מסלול הגרלה' },
          { value: 'createdAt', label: 'תאריך יצירה' },
        ];
      },
    },
    service: EventService,
  };
}

class EventService<T extends Entity | Event> extends BaseEntityService<T> {
  async getReportData(req: CrudRequest): Promise<CommonReportData> {
    const extra = req.parsed.extra as any;
    const reportName = extra?.report;

    switch (reportName) {
      case 'eventExport': {
        const userId = getUserIdFromUser(req.auth);
        const ids = extra?.ids?.toString() || '';

        return {
          generator: eventExportReport,
          params: {
            userId,
            ids,
          },
        };
      }

      default:
        return super.getReportData(req);
    }
  }

  async doAction(req: CrudRequest<any, any>, body: any): Promise<any> {
    const extra = req.parsed.extra as any;
    switch (extra.action) {
      case 'teacherAssociation': {
        const teacherIds = extra.teacherReferenceIds?.toString()?.split(',') || [];
        const eventIds = extra.ids?.toString()?.split(',') || [];
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
      case 'fixReferences': {
        const ids = extra.ids.toString().split(',').map(Number);
        return fixReferences(this.repo as Repository<Event>, ids, { studentReferenceId: 'studentClassReferenceId' });
      }
      case 'lotteryNameUpdate': {
        const lotteryName = extra.lotteryName;
        const eventIds = extra.ids?.toString()?.split(',') || [];
        if (eventIds.length > 0) {
          await this.dataSource.getRepository(Event).update(eventIds, { lotteryName });
        }
        return 'שם הגרלה עודכן בהצלחה';
      }
    }
    return super.doAction(req, body);
  }
}

export default getConfig();
