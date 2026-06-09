import { DeepPartial, In, IsNull, Repository } from 'typeorm';
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
import { getCurrentHebrewYear } from '@shared/utils/entity/year.util';
import { assignTeachersByRules } from 'src/utils/teacher-assignment.util';
import { getAsNumber, getAsArray, getAsString, getAsNumberArray } from '@shared/utils/queryParam.util';

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
        previousSimcha: { eager: true },
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
          previousSimcha: { eager: true },
        };
        req.options.query.sort = [{ field: 'student.familyReferenceId', order: 'ASC' }];
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
          { value: (row: any) => row.previousSimcha?.previousSimchaDescription || '', label: 'שמחה קודמת' },
          { value: (row: any) => row.previousSimcha?.previousTeacherName || '', label: 'מורה בשמחה קודמת' },
          { value: (row: any) => row.previousSimcha?.previousEventHebrewDate || '', label: 'תאריך שמחה קודמת' },
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
          { value: 'lotteryName', label: 'מסלול הגרלה' },
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
        const eventIds: number[] = getAsNumberArray(extra.ids) ?? [];
        const userId = getUserIdFromUser(req.auth);
        return this.setTeacherAssociation(eventIds, userId);
      }
      case 'manualTeacherAssignment': {
        const eventIds: number[] = getAsNumberArray(extra.ids) ?? [];
        const userId = getUserIdFromUser(req.auth);
        const rawTeacherId = getAsNumber(extra.teacherReferenceId);
        const teacherReferenceId = rawTeacherId ? Number(rawTeacherId) : null;
        return this.manualTeacherAssignment(eventIds, userId, teacherReferenceId);
      }
      case 'fixReferences': {
        const ids = getAsNumberArray(extra.ids) ?? [];
        return fixReferences(this.repo as Repository<Event>, ids, { studentReferenceId: 'studentClassReferenceId' });
      }
      case 'lotteryNameUpdate': {
        const lotteryName = getAsString(extra.lotteryName);
        const ids = getAsNumberArray(extra.ids) ?? [];
        return this.updateLotteryName(lotteryName, ids);
      }
      case 'yearUpdate': {
        const year = getAsNumber(extra.year);
        const eventIds = getAsNumberArray(extra.ids) ?? [];
        return this.updateYearForEvents(eventIds, year);
      }
    }
    return super.doAction(req, body);
  }

  private async setTeacherAssociation(eventIds: number[], userId: number): Promise<string> {
    const assignmentMap = await assignTeachersByRules(eventIds, this.dataSource, userId);

    const updates: Promise<any>[] = [];
    for (const [eventId, teacherReferenceId] of assignmentMap) {
      if (teacherReferenceId != null) {
        updates.push(
          this.dataSource.getRepository(Event).update({ id: eventId, userId }, { teacherReferenceId }),
        );
      }
    }
    await Promise.all(updates);
    return 'האירועים עודכנו בהצלחה';
  }

  private async manualTeacherAssignment(eventIds: number[], userId: number, teacherReferenceId: number | null): Promise<string> {
    await this.dataSource
      .getRepository(Event)
      .update({ id: In(eventIds), userId }, { teacherReferenceId });
    return 'האירועים עודכנו בהצלחה';
  }

  private async updateLotteryName(lotteryName: string, ids: number[]): Promise<string> {
    if (ids.length > 0) {
      const eventIds = await this.dataSource.getRepository(Event)
        .find({
          where: [
            { id: In(ids), lotteryName: IsNull() },
            { id: In(ids), lotteryName: '' },
          ],
          select: ['id'],
        }).then(events => events.map(e => e.id));
      if (eventIds.length > 0) {
        await this.dataSource.getRepository(Event).update(eventIds, { lotteryName });
      }
    }
    return 'שם הגרלה עודכן בהצלחה';
  }

  private async updateYearForEvents(eventIds: number[], year: number): Promise<string> {
    if (eventIds.length > 0 && year) {
      await this.dataSource.getRepository(Event).update(eventIds, { year });
    }
    return 'השנה עודכנה בהצלחה';
  }
}

export default getConfig();
