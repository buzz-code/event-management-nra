import { BaseEntityModuleOptions } from '@shared/base-entity/interface';
import { UnreportedEvent } from '../db/entities/UnreportedEvent.entity';
import { IHeader } from '@shared/utils/exporter/types';
import { CrudRequest } from '@dataui/crud';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: UnreportedEvent,
    query: {
      join: {
        student: { eager: false },
        eventType: { eager: false },
        reporterStudent: { eager: false },
      },
    },
    exporter: {
      processReqForExport(req: CrudRequest, innerFunc) {
        req.options.query.join = {
          student: { eager: true },
          eventType: { eager: true },
          reporterStudent: { eager: true },
        };
        return innerFunc(req);
      },
      getExportHeaders(): IHeader[] {
        return [
          { value: 'student.tz', label: 'תז תלמידה' },
          { value: 'student.name', label: 'שם תלמידה' },
          { value: 'eventType.name', label: 'סוג אירוע' },
          { value: 'reporterStudent.name', label: 'דווח ע"י' },
          { value: 'year', label: 'שנה' },
        ];
      },
    },
  };
}

export default getConfig();
