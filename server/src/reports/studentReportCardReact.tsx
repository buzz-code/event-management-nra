import * as React from 'react';
import { In } from 'typeorm';
import { User } from 'src/db/entities/User.entity';
import { convertToReactStyle, ReportStyles } from '@shared/utils/report/react-user-styles/reportStyles';
import { wrapWithStyles, useStyles, useFontLinks } from '@shared/utils/report/react-user-styles/StylesContext';
import { Student } from 'src/db/entities/Student.entity';
import { Klass } from 'src/db/entities/Klass.entity';
import { Lesson } from 'src/db/entities/Lesson.entity';
import { Teacher } from 'src/db/entities/Teacher.entity';
import { AttReportAndGrade } from 'src/db/view-entities/AttReportAndGrade.entity';
import { KlassTypeEnum } from 'src/db/entities/KlassType.entity';
import { IGetReportDataFunction } from '@shared/utils/report/report.generators';
import { ReactToPdfReportGenerator } from '@shared/utils/report/react-to-pdf.generator';
import { StudentBaseKlass } from 'src/db/view-entities/StudentBaseKlass.entity';
import { StudentPercentReport } from 'src/db/view-entities/StudentPercentReport.entity';
import { Image, ImageTargetEnum } from '@shared/entities/Image.entity';
import { GradeName } from 'src/db/entities/GradeName.entity';
import { AttGradeEffect } from 'src/db/entities/AttGradeEffect';
import { KnownAbsence } from 'src/db/entities/KnownAbsence.entity';
import { formatHebrewDate } from '@shared/utils/formatting/formatter.util';
import { groupDataByKeysAndCalc, calcSum, groupDataByKeys, getItemById } from 'src/utils/reportData.util';
import { getDisplayGrade, getAttPercents, getUnknownAbsCount, calcReportsData, getReportsFilterForReportCard, getGradeEffect, getDisplayable } from 'src/utils/studentReportData.util';
import { getReportDateFilter, dateFromString } from '@shared/utils/entity/filters.util';
import { StudentSpeciality } from 'src/db/view-entities/StudentSpeciality.entity';

enum ReportElementType {
    DOCUMENT = 'document',           // General document text
    TABLE_HEADER = 'tableHeader',    // Table headers
    TABLE_CELL = 'tableCell',        // Table content
    TITLE_PRIMARY = 'titlePrimary',  // h2 headers (student name, class)
    TITLE_SECONDARY = 'titleSecondary', // h3 headers (dates)
    TITLE_THIRD = 'titleThird',      // h3 headers (comments)
}

const defaultReportStyles: ReportStyles = [
    {
        type: ReportElementType.DOCUMENT,
        fontFamily: 'Roboto',
        fontSize: 12,
        isBold: false,
        isItalic: false
    },
    {
        type: ReportElementType.TABLE_HEADER,
        fontSize: 16,
        isBold: true,
    },
    {
        type: ReportElementType.TABLE_CELL,
        fontSize: 16,
    },
    {
        type: ReportElementType.TITLE_PRIMARY,
        fontSize: 18,
        isBold: true,
    },
    {
        type: ReportElementType.TITLE_SECONDARY,
        fontSize: 16,
        isBold: true,
    },
    {
        type: ReportElementType.TITLE_THIRD,
        fontSize: 16,
        isBold: true,
    }
];


interface IExtenedStudentPercentReport extends StudentPercentReport {
    isBaseKlass?: boolean;
    isSpecial?: boolean;
    approvedAbsCount?: number;
}
interface ReportDataArrItem {
    reports: IExtenedStudentPercentReport[];
    id: number;
    name?: string;
    order?: number;
}
interface AppProps {
    userStyles: ReportStyles;
    images: {
        reportLogo: Image;
        reportBottomLogo: Image;
    };
    student: Student;
    studentBaseKlass: StudentBaseKlass;
    studentSpeciality: StudentSpeciality;
    reportParams: IReportParams;
    reports: ReportDataArrItem[];
    knownAbsMap: Record<string, Record<string, number>>;
    att_grade_effect: AttGradeEffect[];
    grade_names: GradeName[];
};
const useAppStyles = () => {
    const appStyle: React.CSSProperties = {
        ...convertToReactStyle(useStyles(ReportElementType.DOCUMENT)),
        height: 'calc(100vh - 16px)',
    }
    return { appStyle };
};
const appTableStyle: React.CSSProperties = {
    width: '100%',
}
const App: React.FunctionComponent<AppProps> = (props) => {
    const { appStyle } = useAppStyles();
    const fontLinks = useFontLinks();

    return (
        <div dir='rtl' style={appStyle}>
            {fontLinks.map((link, index) => (<link key={index} rel='stylesheet' href={link} />))}
            <table style={appTableStyle}>
                <thead><tr><th>
                    <Header image={props.images.reportLogo} />
                </th></tr></thead>
                <tbody><tr><td>
                    <ReportTable student={props.student} 
                        studentBaseKlass={props.studentBaseKlass} studentSpeciality={props.studentSpeciality}
                        reports={props.reports} reportParams={props.reportParams}
                        knownAbsMap={props.knownAbsMap}
                        att_grade_effect={props.att_grade_effect} grade_names={props.grade_names} />
                    <PersonalNote note={props.reportParams.personalNote} />
                    <YomanetNotice />
                </td></tr></tbody>
                <tfoot><tr><td>
                    <Footer image={props.images.reportBottomLogo} />
                </td></tr></tfoot>
            </table>
        </div>
    );
};

const headerImageStyle: React.CSSProperties = {
    width: '95%',
    margin: '0 2.5%',
}
const Header = ({ image }: { image: Image }) => image && (
    <img src={image.fileData.src} style={headerImageStyle} />
);

const footerContainerStyle: React.CSSProperties = {
    paddingTop: '1rem',
}
const footerImageWrapperStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    right: 0,
    width: '100%',
}
const placeHolderFooterImageWrapperStyle: React.CSSProperties = {
    width: '100%',
    visibility: 'hidden',
}
const footerImageStyle: React.CSSProperties = {
    width: '95%',
    margin: '0 2.5%',
}
const Footer = ({ image }: { image: Image }) => image && (
    <div style={footerContainerStyle}>
        <div style={placeHolderFooterImageWrapperStyle}>
            <img src={image.fileData.src} style={footerImageStyle} />
        </div>
        <div style={footerImageWrapperStyle}>
            <img src={image.fileData.src} style={footerImageStyle} />
        </div>
    </div>
);

const PersonalNote = ({ note }: { note: string }) => note && (
    <h4>{note}</h4>
);

const yomanetNoticeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    right: 0,
    zIndex: 99999,
    transform: 'rotate(90deg)',
    transformOrigin: 'right top',
};
const YomanetNotice = () => (
    <small style={yomanetNoticeStyle}>
        הופק באמצעות תוכנת יומנט
    </small>
);

const containerStyle: React.CSSProperties = {
    width: 'calc(100% - 100px)',
    maxWidth: 1200,
    margin: 'auto',
    textAlign: 'center',
    paddingTop: 2,
}
interface ReportTableProps {
    student: AppProps['student'];
    studentBaseKlass: AppProps['studentBaseKlass'];
    studentSpeciality: AppProps['studentSpeciality'];
    reports: AppProps['reports'];
    reportParams: AppProps['reportParams'];
    knownAbsMap: AppProps['knownAbsMap'];
    att_grade_effect: AppProps['att_grade_effect'];
    grade_names: AppProps['grade_names'];
}
const ReportTable: React.FunctionComponent<ReportTableProps> = ({ student, studentBaseKlass, studentSpeciality, reports, reportParams, knownAbsMap, att_grade_effect, grade_names }) => {
    const studentCommentHeader = [
        !reportParams.downComment && { level: 4, label: 'התמחות', value: student?.comment }
    ];
    const baseHeader = [
        { level: 2, label: 'שם התלמידה', value: student?.name },
        reportParams.showStudentTz && { level: 2, label: 'מספר תז', value: student?.tz },
        { level: 2, label: 'כיתה', value: !reportParams.groupByKlass && studentBaseKlass?.klassName },
    ];
    const middleHeader = [
        { level: 3, label: 'תאריך הנפקה', value: formatHebrewDate(new Date()) },
    ];
    const studentSmallCommentHeader = [
        reportParams.downComment && { level: 4, label: 'התמחות', value: studentSpeciality?.klassName }
    ];

    return (
        <div style={containerStyle}>
            <ReportTableHeaderWrapper items={middleHeader} justify='flex-end' />
            <ReportTableHeaderWrapper items={studentCommentHeader} />
            <ReportTableHeaderWrapper items={baseHeader} />
            <ReportTableHeaderWrapper items={studentSmallCommentHeader} />

            {reports.map((item, index) => (
                <ReportTableContent key={index} reportData={item} reportParams={reportParams}
                    knownAbsMap={knownAbsMap}
                    att_grade_effect={att_grade_effect} grade_names={grade_names} />
            ))}
        </div>
    );
}

const headerWrapperStyle: React.CSSProperties = {
    display: 'flex',
    paddingBottom: 12,
    paddingInline: '20px',
}
interface ReportTableHeaderWrapperProps {
    items: { level: number, label: string, value: string }[];
    align?: React.CSSProperties['alignItems'];
    justify?: React.CSSProperties['justifyContent'];
}
const ReportTableHeaderWrapper: React.FunctionComponent<ReportTableHeaderWrapperProps> = ({ items, align = 'center', justify = 'space-around' }) => {
    const itemsToShow = items.filter(Boolean).filter(item => item.value);

    return itemsToShow.length > 0 && (
        <div style={{ ...headerWrapperStyle, alignItems: align, justifyContent: justify }}>
            {itemsToShow.map((item, index) => <ReportTableHeaderItem key={index} {...item} />)}
        </div>
    );
}

const headerLevelStyles = {
    2: ReportElementType.TITLE_PRIMARY,
    3: ReportElementType.TITLE_SECONDARY,
    4: ReportElementType.TITLE_THIRD,
}
const useHeaderStyleByLevel = (level: number): React.CSSProperties => ({
    ...convertToReactStyle(useStyles(
        headerLevelStyles[level] as ReportElementType | ReportElementType.DOCUMENT
    )),
    margin: 0,
});

const ReportTableHeaderItem = ({ level, label, value }) => {
    if (!value) return null;

    const HeaderTag = `h${level}` as keyof JSX.IntrinsicElements;
    const style = useHeaderStyleByLevel(level);

    return (
        <HeaderTag style={style}>
            {label && <>{label}:&nbsp;</>}
            <span style={{ fontWeight: 'normal' }}>
                <ReportTableValueWithLineBreak value={value} />
            </span>
        </HeaderTag>
    );
};
const ReportTableValueWithLineBreak = ({ value }) => {
    if (!value) return null;

    const parts = value.split('&');
    if (parts.length === 1) return value;

    return parts.map((item, index) => (
        <div key={index}>{item}</div>
    ));
}

const reportDataWrapperStyle: React.CSSProperties = {
    paddingTop: '2rem',
}
const reportDataWrapperStyle2: React.CSSProperties = {
    pageBreakInside: 'avoid',
    ...reportDataWrapperStyle,
}
const commonTableStyle: React.CSSProperties = {
    border: '1px solid black',
    padding: '.75em',
    textAlign: 'center',
}

const tableStyle: React.CSSProperties = {
    ...commonTableStyle,
    borderCollapse: 'collapse',
    width: '100%',
    marginTop: '.5em',
}

const useThStyles = () => {
    const thStyle: React.CSSProperties = {
        ...commonTableStyle,
        ...convertToReactStyle(useStyles(ReportElementType.TABLE_HEADER)),
        border: '3px solid black',
    }

    const rightAlignThStyle: React.CSSProperties = {
        ...thStyle,
        textAlign: 'right',
    }

    return { thStyle, rightAlignThStyle };
}

const useCellStyles = () => {
    const fullCellStyle: React.CSSProperties = {
        ...commonTableStyle,
        ...convertToReactStyle(useStyles(ReportElementType.TABLE_CELL)),
        minWidth: 75,
        maxWidth: 100,
    }

    const rightAlignFullCellStyle: React.CSSProperties = {
        ...fullCellStyle,
        textAlign: 'right',
    }

    const emptyCellStyle: React.CSSProperties = {
        ...commonTableStyle,
        ...convertToReactStyle(useStyles(ReportElementType.TABLE_CELL)),
        minWidth: 60,
    }

    return { fullCellStyle, rightAlignFullCellStyle, emptyCellStyle };
}
interface ReportTableContentProps {
    reportData: ReportDataArrItem;
    reportParams: AppProps['reportParams'];
    knownAbsMap: AppProps['knownAbsMap'];
    att_grade_effect: AppProps['att_grade_effect'];
    grade_names: AppProps['grade_names'];
}
const ReportTableContent: React.FunctionComponent<ReportTableContentProps> = ({ reportData, reportParams, knownAbsMap, att_grade_effect, grade_names }) => {
    const reportTableHeader = [
        { level: 2, label: '', value: reportParams.groupByKlass && reportData.name }
    ]

    const { thStyle, rightAlignThStyle } = useThStyles();

    return (
        <div style={reportDataWrapperStyle}>
            <ReportTableHeaderWrapper items={reportTableHeader} />
            <table style={tableStyle}>
                {reportData.reports.length > 0 && <>
                    <tr>
                        <th style={rightAlignThStyle}>מקצוע</th>
                        <th style={thStyle}>שם המורה</th>
                        {reportParams.attendance && <th style={thStyle}>אחוז נוכחות</th>}
                        {reportParams.grades && <th style={thStyle}>ציון</th>}
                        {reportParams.debug && <th style={thStyle}>פירוט</th>}
                    </tr>

                    {!reportParams.minimalReport && reportData.reports.map((item, index) => (
                        <ReportItem key={index} reportParams={reportParams} report={item}
                            att_grade_effect={att_grade_effect} grade_names={grade_names} />
                    ))}

                    {!reportParams.hideAbsTotal && reportParams.attendance && (
                        <ReportAbsTotal id={reportData.id} reports={reportData.reports} reportParams={reportParams} knownAbsMap={knownAbsMap} />
                    )}
                </>}
            </table>
        </div>
    );
}

interface ReportItemProps {
    reportParams: AppProps['reportParams'];
    report: AppProps['reports'][number]['reports'][number];
    att_grade_effect: AppProps['att_grade_effect'];
    grade_names: AppProps['grade_names'];
}
const ReportItem: React.FunctionComponent<ReportItemProps> = ({ reportParams, report, att_grade_effect, grade_names }) => {
    var unApprovedAbsCount = getUnknownAbsCount(report.absCount, report.approvedAbsCount);
    var gradeEffect = getGradeEffect(att_grade_effect, report.attPercents, unApprovedAbsCount);
    var displayGrade = getDisplayGrade(report.gradeAvg, gradeEffect, grade_names);
    const debugDetails = `
        חיסורים: ${report.absCount}, מאושרים: ${report.approvedAbsCount}, שיעורים: ${report.lessonsCount},
        אחוז נוכחות: ${Math.round(report.attPercents * 100)} אחוז חיסור: ${Math.round(report.absPercents * 100)},
        ציון: ${report.gradeAvg ? report.gradeAvg * 100 : '-'}, השפעה: ${gradeEffect}, ציון סופי: ${displayGrade}
    `;

    const { fullCellStyle, rightAlignFullCellStyle, emptyCellStyle } = useCellStyles();

    return <tr>
        <td style={rightAlignFullCellStyle}>{getDisplayable(report.lesson)}</td>
        <td style={fullCellStyle}>
            {getDisplayable(report.teacher)}
        </td>

        {report.isSpecial
            ? <>
                {reportParams.attendance && <td style={fullCellStyle}>&nbsp;</td>}
                <td style={fullCellStyle}>{Math.round(report.gradeAvg)}</td>
                {reportParams.debug && <td style={fullCellStyle}>{debugDetails}</td>}
            </>
            : <>
                {reportParams.attendance && <td style={fullCellStyle}>{Math.round(report.attPercents * 100)}%</td>}
                {reportParams.grades && (
                    <td style={fullCellStyle}>
                        {(report.gradeAvg != undefined && report.gradeAvg != null && report.gradeAvg > 0)
                            ? displayGrade
                            : <>&nbsp;</>
                        }
                    </td>
                )}
                {reportParams.debug && <td style={fullCellStyle}>{debugDetails}</td>}
            </>}
    </tr>;
}

interface ReportAbsTotalProps {
    id: number;
    reports: AppProps['reports'][number]['reports'];
    reportParams: AppProps['reportParams'];
    knownAbsMap: AppProps['knownAbsMap'];
}
const ReportAbsTotal: React.FunctionComponent<ReportAbsTotalProps> = ({ id, reports, reportParams, knownAbsMap }) => {
    const reportsNoSpecial = reports.filter(item => !item.isSpecial)
    const lessonsCount = calcSum(reportsNoSpecial, item => item.lessonsCount);
    const absCount = calcSum(reportsNoSpecial, item => item.absCount);
    const knownAbs = reportParams.groupByKlass ? knownAbsMap[String(id)] : Object.values(knownAbsMap)[0];
    const approvedAbsCount = calcSum(Object.values(knownAbs || {}), item => item);
    const unknownAbsCount = getUnknownAbsCount(absCount, approvedAbsCount);
    const attPercents = getAttPercents(lessonsCount, absCount);
    const approvedAttPercents = getAttPercents(lessonsCount, unknownAbsCount);

    const { thStyle } = useThStyles();

    return <>
        <tr>
            <th style={thStyle}>אחוז נוכחות כללי</th>
            <th style={thStyle}>&nbsp;</th>
            <th style={thStyle}>{attPercents}%</th>
            {reportParams.grades && <th style={thStyle}>&nbsp;</th>}
            {reportParams.debug && <th style={thStyle}>&nbsp;</th>}
        </tr>
        <tr>
            <th style={thStyle}>נוכחות בקיזוז חיסורים מאושרים</th>
            <th style={thStyle}>&nbsp;</th>
            <th style={thStyle}>{approvedAttPercents}%</th>
            {reportParams.grades && <th style={thStyle}>&nbsp;</th>}
            {reportParams.debug && <th style={thStyle}>&nbsp;</th>}
        </tr>
    </>;
}

export interface IReportParams {
    userId: number;
    studentId: number;
    year: number;
    startDate?: string;
    endDate?: string;
    globalLessonReferenceIds?: string;
    denyLessonReferenceIds?: string;
    attendance: boolean;
    grades: boolean;
    personalNote?: string;
    groupByKlass?: boolean;
    hideAbsTotal?: boolean;
    minimalReport?: boolean;
    forceGrades?: boolean;
    forceAtt?: boolean;
    showStudentTz?: boolean;
    downComment?: boolean;
    lastGrade?: boolean;
    debug?: boolean;
}
export const getReportData: IGetReportDataFunction<IReportParams, AppProps> = async (params, dataSource) => {
    const reportDate = getReportDateFilter(dateFromString(params.startDate), dateFromString(params.endDate));

    const [user, student, studentReports, studentBaseKlass, studentSpeciality, reportLogo, reportBottomLogo, knownAbsences] = await Promise.all([
        dataSource.getRepository(User).findOneBy({ id: params.userId }),
        dataSource.getRepository(Student).findOneBy({ id: params.studentId }),
        dataSource.getRepository(AttReportAndGrade).find({ where: getReportsFilterForReportCard(params.studentId, params.year, reportDate, params.globalLessonReferenceIds, params.denyLessonReferenceIds), order: { reportDate: 'ASC' } }),
        dataSource.getRepository(StudentBaseKlass).findOneBy({ id: params.studentId, year: params.year }),
        dataSource.getRepository(StudentSpeciality).findOneBy({ id: params.studentId, year: params.year }),
        dataSource.getRepository(Image).findOneBy({ userId: params.userId, imageTarget: ImageTargetEnum.reportLogo }),
        dataSource.getRepository(Image).findOneBy({ userId: params.userId, imageTarget: ImageTargetEnum.reportBottomLogo }),
        dataSource.getRepository(KnownAbsence).findBy({ studentReferenceId: params.studentId, year: params.year, isApproved: true, reportDate }),
    ])

    const [klasses, lessons, teachers, att_grade_effect, grade_names] = await Promise.all([
        dataSource.getRepository(Klass).find({ where: { id: In(studentReports.map(item => item.klassReferenceId)) }, relations: { klassType: true } }),
        dataSource.getRepository(Lesson).find({ where: { id: In(studentReports.map(item => item.lessonReferenceId)) } }),
        dataSource.getRepository(Teacher).find({ where: { id: In(studentReports.map(item => item.teacherReferenceId)) } }),
        dataSource.getRepository(AttGradeEffect).find({ where: { userId: student.userId }, order: { percents: 'DESC', count: 'ASC' } }),
        dataSource.getRepository(GradeName).find({ where: { userId: student.userId }, order: { key: 'DESC' } }),
    ]);

    if (params.attendance && !params.grades) {
        params.forceAtt = true;
    }
    if (params.grades && !params.attendance) {
        params.forceGrades = true;
    }

    const knownAbsMap = groupDataByKeysAndCalc(knownAbsences, ['klassReferenceId'], (arr) => groupDataByKeysAndCalc(arr, ['lessonReferenceId'], (arr) => calcSum(arr, item => item.absnceCount)));
    const reports = getReports(params, studentReports, knownAbsMap, studentBaseKlass, klasses, lessons, teachers);

    return {
        userStyles: user?.additionalData?.reportStyles,
        images: { reportLogo, reportBottomLogo },
        student,
        studentBaseKlass,
        studentSpeciality,
        reportParams: params,
        reports,
        knownAbsMap,
        att_grade_effect,
        grade_names,
    };
}

function getReports(
    reportParams: IReportParams,
    reports: AttReportAndGrade[],
    knownAbsMap: Record<string, Record<string, number>>,
    studentBaseKlass: AppProps['studentBaseKlass'],
    klasses: Klass[],
    lessons: Lesson[],
    teachers: Teacher[],
): AppProps['reports'] {
    const dataMap = groupDataByKeys(reports, ['teacherReferenceId', 'klassReferenceId', 'lessonReferenceId']);

    const data = Object.entries(dataMap).map(([key, val]) => {
        const { userId, year, studentReferenceId, klassReferenceId, lessonReferenceId, teacherReferenceId } = val[0];
        const knownAbsences = knownAbsMap[klassReferenceId]?.[lessonReferenceId];
        const { lessonsCount, absCount, approvedAbsCount, attPercents, absPercents, gradeAvg, lastGrade } = calcReportsData(val, [{ absnceCount: knownAbsences }]);
        const teacher = getItemById(teachers, val[0].teacherReferenceId);
        const klass = getItemById(klasses, val[0].klassReferenceId);
        const lesson = getItemById(lessons, val[0].lessonReferenceId);
        const grade = reportParams.lastGrade ? lastGrade : gradeAvg;

        const dataItem: IExtenedStudentPercentReport = {
            id: '',
            studentBaseKlass: null,
            studentReferenceId,
            klassReferenceId,
            lessonReferenceId,
            teacherReferenceId,
            userId,
            year,
            student: null,
            teacher,
            klass,
            lesson,
            isBaseKlass: klass?.klassType?.klassTypeEnum === KlassTypeEnum.baseKlass,
            lessonsCount,
            absCount,
            approvedAbsCount,
            attPercents,
            absPercents,
            gradeAvg: grade,
        };

        return dataItem;
    });

    const filteredReports = filterReports(data, reportParams);

    filteredReports.sort((a, b) => (a.lesson?.order || 0) - (b.lesson?.order || 0));

    return groupReportsByKlass(filteredReports, reportParams, studentBaseKlass);
}

function filterReports(reports: IExtenedStudentPercentReport[], reportParams: IReportParams): AppProps['reports'][number]['reports'] {
    return reports.filter(report => {
        return !(
            (reportParams.forceGrades && (report.gradeAvg === undefined || report.gradeAvg === null)) ||
            (reportParams.forceAtt && !report.lessonsCount)
        )
        // return this only if someone asks for it
        // }).map(report => {
        //     return {
        //         ...report,
        //         isSpecial: report.lessonsCount && report.lessonsCount * 2 == report.absCount,
        //     }
    });
}

function groupReportsByKlass(reports: AppProps['reports'][number]['reports'], reportParams: IReportParams, studentBaseKlass: AppProps['studentBaseKlass']): AppProps['reports'] {
    if (reportParams.groupByKlass) {
        const klasses: Record<number, ReportDataArrItem> = {};
        reports.forEach(item => {
            const name = getDisplayable(item.klass);
            klasses[name] ??= {
                name: name,
                id: item.klass.id,
                order: item.isBaseKlass ? -1 : 1,
                reports: [],
            };
            klasses[name].reports.push(item);
        })
        return Object.values(klasses).sort((a, b) => a.order - b.order);
    } else {
        return [{ reports, id: studentBaseKlass?.id }];
    }
}

const getReportNameByDataItem = data => `תעודה לתלמידה ${data.student?.name ?? ''} כיתה ${data.studentBaseKlass?.klassName ?? ''} `;
export const getReportName = data => Array.isArray(data) ? data.map(getReportNameByDataItem).join() : getReportNameByDataItem(data);

export default new ReactToPdfReportGenerator(getReportName, getReportData, wrapWithStyles(App, defaultReportStyles));
