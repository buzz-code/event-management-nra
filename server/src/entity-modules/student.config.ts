import { CrudRequest } from "@dataui/crud";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { Student } from "src/db/entities/Student.entity";
import { CommonReportData } from "@shared/utils/report/types";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: Student,
        query: {
            join: {
                class: {},
                events: {}
            }
        },
        exporter: {
            processReqForExport(req: CrudRequest, innerFunc) {
                req.options.query.join = {
                    class: { eager: true },
                    events: { eager: true }
                };
                return innerFunc(req);
            },
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'id', label: 'מזהה' },
                    { value: 'first_name', label: 'שם פרטי' },
                    { value: 'last_name', label: 'שם משפחה' },
                    { value: 'address', label: 'כתובת' },
                    { value: 'mother_name', label: 'שם האם' },
                    { value: 'mother_contact', label: 'טלפון האם' },
                    { value: 'father_name', label: 'שם האב' },
                    { value: 'father_contact', label: 'טלפון האב' },
                    { value: 'class.name', label: 'שם כיתה' },
                    { value: 'created_at', label: 'תאריך יצירה' },
                    { value: 'updated_at', label: 'תאריך עדכון' },
                ];
            }
        },
        service: StudentService,
    }
}

class StudentService<T extends Entity | Student> extends BaseEntityService<T> {
    async getReportData(req: CrudRequest<any, any>): Promise<CommonReportData> {
        return super.getReportData(req);
    }
}

export default getConfig();