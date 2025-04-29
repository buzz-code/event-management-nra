import { CrudRequest } from "@dataui/crud";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { StudentKlassReport } from "src/db/view-entities/StudentKlassReport.entity";
import { CommonReportData } from "@shared/utils/report/types";
import studentReportCard from "../reports/studentReportCard";
import { BulkToPdfReportGenerator } from "@shared/utils/report/bulk-to-pdf.generator";
import studentReportCardReact from "src/reports/studentReportCardReact";
import { generateStudentReportCard } from "src/reports/reportGenerator";
import { getUserIdFromUser } from "@shared/auth/auth.util";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: StudentKlassReport,
        query: {
            join: {
                student: {},
            },
        },
        service: StudentKlassReportService,
        exporter: {
            processReqForExport(req: CrudRequest, innerFunc) {
                req.options.query.join = {
                    student: { eager: true },
                };
                return innerFunc(req);
            },
            getExportHeaders() {
                return [
                    { value: 'student.tz', label: 'תז' },
                    { value: 'student.name', label: 'שם' },
                    { value: 'student.comment', label: 'הערה' },
                    { value: 'student.phone', label: 'טלפון' },
                    { value: 'student.year', label: 'כתובת' },
                    { value: 'year', label: 'שנה' },
                    { value: 'klassName1', label: 'כיתת אם' },
                    { value: 'klassName2', label: 'מסלול' },
                    { value: 'klassName3', label: 'התמחות' },
                    { value: 'klassNameNull', label: 'אחר' },
                ]
            },
        }
    }
}

class StudentKlassReportService<T extends Entity | StudentKlassReport> extends BaseEntityService<T> {
    reportsDict = {
        studentReportCard: new BulkToPdfReportGenerator(studentReportCard),
        studentReportCardReact: new BulkToPdfReportGenerator(studentReportCardReact),
    };
    async getReportData(req: CrudRequest<any, any>): Promise<CommonReportData> {
        if (req.parsed.extra.report in this.reportsDict) {
            const userId = getUserIdFromUser(req.auth);
            const generator = this.reportsDict[req.parsed.extra.report];
            return generateStudentReportCard(userId, req.parsed.extra, generator);
        }
        return super.getReportData(req);
    }
}

export default getConfig();