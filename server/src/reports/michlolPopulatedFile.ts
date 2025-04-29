import { IGetReportDataFunction } from '@shared/utils/report/report.generators';
import { DataToExcelReportGenerator, IDataToExcelReportGenerator } from '@shared/utils/report/data-to-excel.generator';
import { Lesson } from 'src/db/entities/Lesson.entity';
import { In } from 'typeorm';
import * as path from 'path';
import { Student } from 'src/db/entities/Student.entity';
import { groupDataByKeys, groupDataByKeysAndCalc } from 'src/utils/reportData.util';
import { getCurrentHebrewYear } from '@shared/utils/entity/year.util';
import { AttReportAndGrade } from 'src/db/view-entities/AttReportAndGrade.entity';
import { calcReportsData, getDisplayGrade, getGradeEffect, getUnknownAbsCount } from 'src/utils/studentReportData.util';
import { KnownAbsence } from 'src/db/entities/KnownAbsence.entity';
import { AttGradeEffect } from 'src/db/entities/AttGradeEffect';
import { BadRequestException } from '@nestjs/common';

export interface MichlolPopulatedFileParams {
    userId: number;
    michlolFileName: string;
    michlolFileData: { [key: string]: string }[];
}
export interface MichlolPopulatedFileData extends IDataToExcelReportGenerator {
    lesson: Partial<Lesson>;
    filename: string;
    extension: string;
}
const getReportData: IGetReportDataFunction = async (params: MichlolPopulatedFileParams, dataSource): Promise<MichlolPopulatedFileData> => {
    const extension = path.extname(params.michlolFileName);
    const filename = path.basename(params.michlolFileName, extension);

    const lessonKey = Number(params.michlolFileData[0]['D'].replace(/\s/g, ''));
    const studentTzs = params.michlolFileData.slice(3).map(row => row['B']).filter(Boolean);

    if (isNaN(lessonKey)) {
        throw new BadRequestException("קוד שיעור לא תקין");
    }

    const [lesson, students] = await Promise.all([
        dataSource.getRepository(Lesson).findOne({ where: { userId: params.userId, key: lessonKey, year: getCurrentHebrewYear() }, select: { id: true, key: true, name: true, userId: true } }),
        dataSource.getRepository(Student).find({ where: { userId: params.userId, tz: In(studentTzs) }, select: { id: true, tz: true } }),
    ]);

    let updatedData = params.michlolFileData;

    if (lesson && students.length > 0) {
        const dataFilter = {
            studentReferenceId: In(students.map(s => s.id)),
            lessonReferenceId: lesson.id,
            year: getCurrentHebrewYear(),
        };
        const [reports, knownAbsences, attGradeEffect] = await Promise.all([
            dataSource.getRepository(AttReportAndGrade).find({ where: dataFilter, order: { reportDate: 'ASC' } }),
            dataSource.getRepository(KnownAbsence).find({ where: { ...dataFilter, isApproved: true } }),
            dataSource.getRepository(AttGradeEffect).find({ where: { userId: lesson.userId }, order: { percents: 'DESC', count: 'ASC' } }),
        ]);

        const studentReportsMap = groupDataByKeys(reports, ['studentReferenceId']);
        const knownAbsencesMap = groupDataByKeys(knownAbsences, ['studentReferenceId']);
        const studentIdMap = groupDataByKeysAndCalc(students, ['tz'], (arr) => arr[0].id);

        updatedData = params.michlolFileData.map(row => {
            const studentId = studentIdMap[row['B']];

            const studentReports = studentReportsMap[studentId] || [];
            const studentKnownAbsences = knownAbsencesMap[studentId] || [];
            const { attPercents, absCount, approvedAbsCount, gradeAvg, lessonsCount, lastGrade } = calcReportsData(studentReports, studentKnownAbsences);
            // TODO add param here to use lastGrade or gradeAvg
            const unapprovedAbsCount = getUnknownAbsCount(absCount, approvedAbsCount);
            const gradeEffect = getGradeEffect(attGradeEffect, attPercents, unapprovedAbsCount);
            const displayGrade = getDisplayGrade(lastGrade, gradeEffect);
            const finalGrade = parseInt(displayGrade.replace('%', ''));

            return {
                ...row,
                E: String(finalGrade || row['E']),
            };
        });
    }

    const specialFields = updatedData.map((row, index) => ([
        { cell: { c: 0, r: index }, value: row['A'] },
        { cell: { c: 1, r: index }, value: row['B'] },
        { cell: { c: 2, r: index }, value: row['C'] },
        { cell: { c: 3, r: index }, value: row['D'] },
        { cell: { c: 4, r: index }, value: row['E'] },
        { cell: { c: 5, r: index }, value: row['F'] },
        { cell: { c: 6, r: index }, value: row['G'] },
        { cell: { c: 7, r: index }, value: row['H'] },
        { cell: { c: 8, r: index }, value: row['I'] },
        { cell: { c: 9, r: index }, value: row['J'] },
        { cell: { c: 10, r: index }, value: row['K'] },
        { cell: { c: 11, r: index }, value: row['L'] },
        { cell: { c: 12, r: index }, value: row['M'] },
        { cell: { c: 13, r: index }, value: row['N'] },
    ])).flat();

    return {
        lesson: lesson ?? {
            key: lessonKey,
            name: params.michlolFileData[0]['C'],
        },
        filename,
        extension,
        headerRow: [],
        formattedData: [],
        sheetName: 'נתונים מעודכנים',
        specialFields,
    };
}

const getReportName = (data: MichlolPopulatedFileData) => `${data.lesson?.key} - ${data.lesson?.name}`;

export default new DataToExcelReportGenerator(getReportName, getReportData);
