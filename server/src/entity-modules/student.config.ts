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
                class: { eager: false },
                events: { eager: false }
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
                    { value: 'tz', label: 'ת.ז.' },
                    { value: 'firstName', label: 'שם פרטי' },
                    { value: 'lastName', label: 'שם משפחה' },
                    { value: 'address', label: 'כתובת' },
                    { value: 'motherName', label: 'שם האם' },
                    { value: 'motherContact', label: 'טלפון האם' },
                    { value: 'fatherName', label: 'שם האב' },
                    { value: 'fatherContact', label: 'טלפון האב' },
                    { value: 'class.name', label: 'שם כיתה' }
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