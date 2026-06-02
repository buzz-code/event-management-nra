import { In } from 'typeorm';
import { CrudRequest } from '@dataui/crud';
import { BaseEntityModuleOptions, Entity } from '@shared/base-entity/interface';
import { BaseEntityService } from '@shared/base-entity/base-entity.service';
import { IHeader } from '@shared/utils/exporter/types';
import { FamilyTeacherAssignment } from 'src/db/entities/FamilyTeacherAssignment.entity';
import { getUserIdFromUser } from '@shared/auth/auth.util';
import { getAsNumber, getAsNumberArray } from '@shared/utils/queryParam.util';

function getConfig(): BaseEntityModuleOptions {
  return {
    entity: FamilyTeacherAssignment,
    query: {
      join: {
        user: { eager: false },
        teacher: { eager: false },
        students: { eager: true, allow: ['id', 'name'] },
      },
    },
    exporter: {
      getExportHeaders(): IHeader[] {
        return [
          { value: 'year', label: 'שנה' },
          { value: 'familyReferenceId', label: 'מזהה משפחה' },
          { value: 'teacherReferenceId', label: 'מורה ברירת מחדל' },
          { value: 'historyJson', label: 'היסטוריה' },
        ];
      },
    },
    service: FamilyTeacherAssignmentService,
  };
}

class FamilyTeacherAssignmentService<T extends Entity | FamilyTeacherAssignment> extends BaseEntityService<T> {
  async doAction(req: CrudRequest<any, any>, body: any): Promise<any> {
    const extra = req.parsed.extra as any;
    switch (extra.action) {
      case 'bulkAssignTeacher': {
        const ids = getAsNumberArray(extra.ids) ?? [];
        const teacherReferenceId = getAsNumber(extra.teacherReferenceId) ?? null;
        const userId = getUserIdFromUser(req.auth);

        if (ids.length === 0) return 'עודכן בהצלחה';
        await this.repo.update({ id: In(ids), userId } as any, { teacherReferenceId } as any);
        return 'עודכן בהצלחה';
      }
      default:
        return super.doAction(req, body);
    }
  }
}

export default getConfig();
