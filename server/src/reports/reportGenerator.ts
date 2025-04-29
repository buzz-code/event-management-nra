import { getCurrentHebrewYear } from "@shared/utils/entity/year.util";
import { BaseReportGenerator } from "@shared/utils/report/report.generators";
import { IReportParams } from "./studentReportCardReact";
import { CrudRequest } from "@dataui/crud";
import teacherReportFile, { TeacherReportFileData, TeacherReportFileParams } from "src/reports/teacherReportFile";
import { getUserIdFromUser } from "@shared/auth/auth.util";
import { getMailAddressForEntity } from "@shared/utils/mail/mail-address.util";
import { FormatString } from "@shared/utils/yemot/yemot.interface";
import { DataSource } from "typeorm";
import { MailSendService } from "@shared/utils/mail/mail-send.service";
import { sendBulkTeacherMailWithFile } from "@shared/utils/report/bulk-mail-file.util";

export function generateStudentReportCard(userId: any, reqExtra: any, generator: BaseReportGenerator) {
    const extraParams: Partial<IReportParams> = {
        year: reqExtra.year ?? getCurrentHebrewYear(),
        startDate: reqExtra.startDate,
        endDate: reqExtra.endDate,
        globalLessonReferenceIds: String(reqExtra.globalLessonReferenceIds),
        denyLessonReferenceIds: String(reqExtra.denyLessonReferenceIds),
        attendance: reqExtra.attendance,
        grades: reqExtra.grades,
        personalNote: reqExtra.personalNote,
        groupByKlass: reqExtra.groupByKlass,
        hideAbsTotal: reqExtra.hideAbsTotal,
        minimalReport: reqExtra.minimalReport,
        forceGrades: reqExtra.forceGrades,
        forceAtt: reqExtra.forceAtt,
        showStudentTz: reqExtra.showStudentTz,
        downComment: reqExtra.downComment,
        lastGrade: reqExtra.lastGrade,
        debug: reqExtra.debug,
    };
    console.log('student report card extra params: ', extraParams);
    const params = reqExtra.ids
        .toString()
        .split(',')
        .map(id => ({
            userId,
            studentId: id,
            ...extraParams
        }));
    return {
        generator,
        params,
    };
}

export function getTeacherStatusFileReportParams(req: CrudRequest<any, any>): TeacherReportFileParams[] {
    console.log('teacher report file params: ', req.parsed.extra);
    const isGrades = req.parsed.extra?.isGrades;
    const lessonReferenceId = parseInt(req.parsed.extra?.lessonReferenceId);
    const params = req.parsed.extra.ids
        .toString()
        .split(',')
        .map(id => ({
            userId: getUserIdFromUser(req.auth),
            id,
            isGrades,
            lessonReferenceId: isNaN(lessonReferenceId) ? undefined : lessonReferenceId,
        }));
    return params;
}

export async function sendTeacherReportFileMail(req: CrudRequest<any, any>, dataSource: DataSource, mailSendService: MailSendService): Promise<string> {
    const params = getTeacherStatusFileReportParams(req);
    const generator = teacherReportFile;
    const targetEntity = req.parsed.extra?.isGrades ? 'grade' : 'att_report';
    const getEmailParamsFromData = async (params: TeacherReportFileParams, data: TeacherReportFileData[]) => {
        const replyToAddress = await getMailAddressForEntity(params.userId, targetEntity, dataSource);
        const textParams = [data[0].teacher.name, data[0].teacherReportStatus.reportMonthName, data.map(item => item.lesson.name).join(', ')];
        const mailSubject = FormatString(req.parsed.extra.mailSubject, textParams);
        const mailBody = FormatString(req.parsed.extra.mailBody, textParams);
        return {
            replyToAddress,
            mailSubject,
            mailBody,
        };
    }
    return sendBulkTeacherMailWithFile(generator, params, req.auth, dataSource, mailSendService, getEmailParamsFromData);
}
