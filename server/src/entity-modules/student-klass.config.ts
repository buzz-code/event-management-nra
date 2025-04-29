import { CrudRequest } from "@dataui/crud";
import { In } from "typeorm";
import { getUserIdFromUser } from "@shared/auth/auth.util";
import { BaseEntityService } from "@shared/base-entity/base-entity.service";
import { BaseEntityModuleOptions, Entity } from "@shared/base-entity/interface";
import { IHeader } from "@shared/utils/exporter/types";
import { BulkToPdfReportGenerator } from "@shared/utils/report/bulk-to-pdf.generator";
import { CommonReportData } from "@shared/utils/report/types";
import { StudentKlass } from "src/db/entities/StudentKlass.entity";
import { generateStudentReportCard } from "src/reports/reportGenerator";
import studentReportCard from "src/reports/studentReportCard";
import studentReportCardReact from "src/reports/studentReportCardReact";
import { fixReferences } from "@shared/utils/entity/fixReference.util";

function getConfig(): BaseEntityModuleOptions {
    return {
        entity: StudentKlass,
        query: {
            join: {
                student: {},
                klass: {},
            },
        },
        exporter: {
            processReqForExport(req: CrudRequest, innerFunc) {
                req.options.query.join = {
                    student: { eager: true },
                    klass: { eager: true },
                };
                return innerFunc(req);
            },
            getExportHeaders(): IHeader[] {
                return [
                    { value: 'student.name', label: 'שם התלמידה' },
                    { value: 'klass.name', label: 'כיתה' },
                ];
            }
        },
        service: StudentKlassService
    }
}

class StudentKlassService<T extends Entity | StudentKlass> extends BaseEntityService<T> {
    reportsDict = {
        studentReportCard: new BulkToPdfReportGenerator(studentReportCard),
        studentReportCardReact: new BulkToPdfReportGenerator(studentReportCardReact),
    };
    async getReportData(req: CrudRequest<any, any>): Promise<CommonReportData> {
        if (req.parsed.extra.report in this.reportsDict) {
            const userId = getUserIdFromUser(req.auth);
            const generator = this.reportsDict[req.parsed.extra.report];
            const ids = req.parsed.extra.ids.toString().split(',');
            const studentIds = await this.dataSource.getRepository(StudentKlass)
                .find({ where: { id: In(ids) }, select: { studentReferenceId: true } })
                .then(res => res.map(item => item.studentReferenceId));
            const extraParams = { ...req.parsed.extra, ids: studentIds };
            return generateStudentReportCard(userId, extraParams, generator);
        }
        return super.getReportData(req);
    }

    async doAction(req: CrudRequest<any, any>, body: any): Promise<any> {
        switch (req.parsed.extra.action) {
            case 'fixReferences': {
                const ids = req.parsed.extra.ids.toString().split(',');
                const referenceFields = {
                    studentTz: 'studentReferenceId',
                    klassId: 'klassReferenceId',
                };
                return fixReferences(this.dataSource.getRepository(StudentKlass), ids, referenceFields);
            }
        }
        return super.doAction(req, body);
    }
}

export default getConfig();