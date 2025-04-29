import { User } from "@shared/entities/User.entity";
import { Chain, HandlerBase } from "@shared/utils/yemot/chain.interface";
import { ReportType, YemotRequest, YemotResponse } from "@shared/utils/yemot/yemot.interface";
import { AttReport } from "src/db/entities/AttReport.entity";
import { Grade } from "src/db/entities/Grade.entity";

type GetExistingReportsFunction = (req: YemotRequest, klassId: string, lessonId: string, sheetName: string) =>
    Promise<Array<any>>;

export interface IReportProperty {
    name: string;
    message: string;
    field: string;
    validate(req: YemotRequest): boolean;
    shouldNotAsk?(req: YemotRequest): Promise<boolean>;
}

class GetSheetNameHandler extends HandlerBase {
    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params.sheetName !== undefined) {
            return next();
        } else if (req.params.isCurrentMonth === undefined) {
            const currentMonth = this.getMonthName(new Date().getMonth() + 1);
            return res.send(res.getText('askIsCurrentMonth', currentMonth), 'isCurrentMonth');
        } else if (req.params.isCurrentMonth === '1') {
            req.params.sheetName = this.getMonthName(new Date().getMonth() + 1);
            return next();
        } else if (req.params.currentMonth === undefined) {
            return res.send(res.getText('askForCurrentMonth'), 'currentMonth');
        } else {
            req.params.sheetName = this.getMonthName(Number(req.params.currentMonth));
            return next();
        }
    }

    getMonthName(number: number) {
        const date = new Date(2009, number - 1, 1);  // 2009-11-10
        const month = date.toLocaleString('he', { month: 'long' });
        return month;
    }
}

class GetExistingReportsHandler extends HandlerBase {
    constructor(private getExistingReports: GetExistingReportsFunction) {
        super();
    }

    async handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params.existingReports === undefined) {
            req.params.existingReports = await this.getExistingReports(req, req.params.klass.data.id, req.params.lesson.data.id, req.params.sheetName);
        }
        return next();
    }
}

class CheckExistingReportsHandler extends HandlerBase {
    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params.existingReports.length > 0) {
            if (req.params.isSkipExistingReports === undefined) {
                return res.send(res.getText('askIfSkipExistingReports'), 'isSkipExistingReports');
            } else if (req.params.idsToSkip === undefined) {
                if (req.params.isSkipExistingReports === '1') {
                    req.params.idsToSkip = [...new Set(req.params.existingReports.map(item => item.studentReferenceId))];
                }
            }
        }
        req.params.idsToSkip ??= [];
        return next();
    }
}

class CheckHowManyLessonsHandler extends HandlerBase {
    constructor(private reportType: ReportType) {
        super();
    }

    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (this.reportType === 'grade') {
            return next();
        }
        if (req.params.howManyLessons === undefined) {
            return res.send(res.getText('howManyLessons'), 'howManyLessons');
        } else if (req.params.howManyLessons === '0') {
            res.send(res.getText('tryAgain'));
            return res.send(res.getText('howManyLessons'), 'howManyLessons');
        }
        return next();
    }
}

class LoadStudentListHandler extends HandlerBase {
    async handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params.students === undefined) {
            const studentList = await req.getStudentsByKlassId(req.params.baseReport.klassReferenceId);
            req.params.students = studentList.filter(item => !req.params.idsToSkip.includes(item.id));
        }
        return next();
    }
}

class GetParamsDataHandler extends HandlerBase {
    constructor(private properties: IReportProperty[]) {
        super();
    }

    async shouldAsk(property: IReportProperty, req: YemotRequest) {
        if (!property.shouldNotAsk) {
            return true;
        }
        return property.shouldNotAsk(req).then(result => !result);
    }

    async handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        req.params.propertyIndex ??= 0;
        while (req.params.propertyIndex < this.properties.length) {
            const prop = this.properties[req.params.propertyIndex];
            const shouldAsk = await this.shouldAsk(prop, req);
            if (shouldAsk) {
                if (req.params[prop.name] === undefined) {
                    return res.send(res.getText(prop.message), prop.name);
                } else if (!req.params[prop.name + 'Validated']) {
                    if (this.isSideMenu(req.params[prop.name], req, res)) {
                        if (res.messages.length) {
                            return;
                        }
                        return next(true);
                    }
                    req.params[prop.name + 'Validated'] = prop.validate(req);
                    if (!req.params[prop.name + 'Validated']) {
                        res.clear();
                        res.send(res.getText('tryAgain'));
                        return res.send(res.getText(prop.message), prop.name);
                    }
                }
            }
            req.params.propertyIndex++;
        }
        return next();
    }

    isSideMenu(value: string, req: YemotRequest, res: YemotResponse) {
        if (req.params.sideMenu !== undefined) {
            value = '*' + req.params.sideMenu;
            req.params.sideMenu = undefined;
        }
        if (value === '*') {
            res.clear();
            res.send(res.getText('sideMenu'), 'sideMenu');
        } else if (value === '*4') {
            res.clear();
            req.params.studentIndex--;
            req.params.studentIndex = Math.max(0, req.params.studentIndex);
        } else if (value === '*6') {
            res.clear();
            req.params.studentIndex++;
        } else {
            return false;
        }
        return true;
    }
}
class SaveAndGoToNextStudent extends HandlerBase {
    constructor(private properties: IReportProperty[], private reportType: ReportType, private beforeSave?: (report: AttReport | Grade, user: User) => void) {
        super();
    }

    async handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        await req.deleteExistingReports(req.params.existing, this.reportType);
        const report: AttReport | Grade = {
            ...req.params.baseReport,
            studentTz: req.params.student.tz,
            comments: '',
            sheetName: req.params.sheetName,
        };
        if (this.reportType === 'att') {
            report.howManyLessons = Number(req.params.howManyLessons);
        }
        for (const prop of this.properties) {
            report[prop.field] = req.params[prop.name];
        }

        const user = await req.getUser();
        this.beforeSave?.(report, user);
        await req.saveReport(report, this.reportType);

        req.params.studentIndex++;
        clearStudentData(req, this.properties);
        return next();
    }
}
function clearStudentData(req: YemotRequest, properties: IReportProperty[]) {
    delete req.params.student;
    delete req.params.existing;
    delete req.params.propertyIndex;
    for (const prop of properties) {
        delete req.params[prop.name];
        delete req.params[prop.name + 'Validated'];
    }
}

class IterateStudentsHandler extends HandlerBase {
    studentChain: Chain;

    constructor(private properties: IReportProperty[], private reportType: ReportType, beforeSave?: (report: AttReport | Grade, user: User) => void) {
        super();
        this.studentChain = new Chain('iterate students', [
            new GetParamsDataHandler(properties),
            new SaveAndGoToNextStudent(properties, this.reportType, beforeSave),
        ]);
    }

    async handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        req.params.studentIndex ??= 0;
        if (req.params.studentIndex < req.params.students.length) {
            res.clear();
            req.params.student ??= req.params.students[req.params.studentIndex];
            req.params.existing ??= req.params.existingReports.filter(item => item.studentReferenceId === req.params.student.id);

            res.send(res.getText('nextStudent', req.params.student.name));
            return this.studentChain.handleRequest(req, res, () => {
                clearStudentData(req, this.properties);

                return this.handleRequest(req, res, next);
            });
        }
        return next();
    }
}


export default function getReportChain(getExistingReports: GetExistingReportsFunction, reportType: ReportType, properties: IReportProperty[], beforeSave?: (report: AttReport | Grade, user: User) => void) {
    return new Chain('get report chain', [
        new GetSheetNameHandler(),
        new GetExistingReportsHandler(getExistingReports),
        new CheckExistingReportsHandler(),
        new CheckHowManyLessonsHandler(reportType),
        new LoadStudentListHandler(),
        new IterateStudentsHandler(properties, reportType, beforeSave),
    ]);
}
