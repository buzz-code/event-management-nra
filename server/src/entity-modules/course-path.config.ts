// filepath: /root/code-server/config/workspace/event-management-nra/server/src/entity-modules/course-path.config.ts
import { CrudRequest } from "@dataui/crud";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { CoursePath } from "src/db/entities/CoursePath.entity";
import { CommonReportData } from "@shared/utils/report/types";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: CoursePath,
        query: {
            join: {
                events: { eager: false }
            }
        },
        exporter: {
            processReqForExport(req: CrudRequest, innerFunc) {
                req.options.query.join = {
                    events: { eager: true }
                };
                return innerFunc(req);
            },
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'id', label: 'מזהה' },
                    { value: 'name', label: 'שם המסלול' },
                    { value: 'description', label: 'תיאור' },
                    { value: 'created_at', label: 'תאריך יצירה' },
                    { value: 'updated_at', label: 'תאריך עדכון' },
                ];
            }
        },
        service: CoursePathService,
    }
}

class CoursePathService<T extends Entity | CoursePath> extends BaseEntityService<T> {
    async getReportData(req: CrudRequest<any, any>): Promise<CommonReportData> {
        return super.getReportData(req);
    }
}

export default getConfig();