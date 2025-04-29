import { CrudRequest } from "@dataui/crud";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { BulkToZipReportGenerator } from "@shared/utils/report/bulk-to-zip.generator";
import { CommonReportData } from "@shared/utils/report/types";
import { TeacherReportStatus } from "src/db/view-entities/TeacherReportStatus.entity";
import teacherReportFile from "src/reports/teacherReportFile";
import { getTeacherStatusFileReportParams, sendTeacherReportFileMail } from "src/reports/reportGenerator";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: TeacherReportStatus,
        exporter: {
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'teacherName', label: 'מורה' },
                    { value: 'reportMonthName', label: 'תקופת דיווח' },
                    { value: 'reportedLessonNames', label: 'שיעורים שדווחו' },
                    { value: 'notReportedLessonNames', label: 'שיעורים שלא דווחו' },
                ];
            }
        },
        service: TeacherReportStatusService,
    }
}

class TeacherReportStatusService<T extends Entity | TeacherReportStatus> extends BaseEntityService<T> {
    reportsDict = {
        teacherReportFile: new BulkToZipReportGenerator(() => 'קבצי נוכחות למורות', teacherReportFile),
    };
    async getReportData(req: CrudRequest<any, any>): Promise<CommonReportData> {
        if (req.parsed.extra.report in this.reportsDict) {
            req.parsed.extra.isGrades = false;
            const generator = this.reportsDict[req.parsed.extra.report];
            const params = getTeacherStatusFileReportParams(req);
            return {
                generator,
                params,
            };
        }
        return super.getReportData(req);
    }

    async doAction(req: CrudRequest<any, any>, body: any): Promise<any> {
        switch (req.parsed.extra.action) {
            case 'teacherReportFile': {
                req.parsed.extra.isGrades = false;
                return sendTeacherReportFileMail(req, this.dataSource, this.mailSendService);
            }
        }
        return super.doAction(req, body);
    }
}

export default getConfig();