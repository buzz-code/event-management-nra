// filepath: /root/code-server/config/workspace/event-management-nra/server/src/entity-modules/level-type.config.ts
import { CrudRequest } from '@dataui/crud';
import { BaseEntityService } from '@shared/base-entity/base-entity.service';
import { BaseEntityModuleOptions, Entity } from '@shared/base-entity/interface';
import { IHeader } from '@shared/utils/exporter/types';
import { LevelType } from 'src/db/entities/LevelType.entity';
import { CommonReportData } from '@shared/utils/report/types';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: LevelType,
    query: {
      join: {
        events: { eager: false },
      },
    },
    exporter: {
      processReqForExport(req: CrudRequest, innerFunc) {
        req.options.query.join = {
          events: { eager: true },
        };
        return innerFunc(req);
      },
      getExportHeaders(): IHeader[] {
        return [
          { value: 'key', label: 'מפתח' },
          { value: 'name', label: 'שם הסוג רמה' },
          { value: 'description', label: 'תיאור' },
          { value: 'year', label: 'שנה' },
        ];
      },
    },
    service: LevelTypeService,
  };
}

class LevelTypeService<T extends Entity | LevelType> extends BaseEntityService<T> {
  async getReportData(req: CrudRequest<any, any>): Promise<CommonReportData> {
    return super.getReportData(req);
  }
}

export default getConfig();
