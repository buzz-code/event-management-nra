import getReportChain, { IReportProperty } from "../attReport.chain";
import { YemotRequest, YemotResponse, YemotResponseMock } from "@shared/utils/yemot/yemot.interface";
import util from "@shared/utils/yemot/yemot.util";

describe("attReport chain", () => {
    let req: YemotRequest;
    let res: YemotResponse;
    let next: jest.Mock<any, any>;
    let chain: ReturnType<typeof getReportChain>;
    const getExistingReports = jest.fn().mockResolvedValue([]);
    const properties: IReportProperty[] = [
        {
            name: 'absCount',
            message: 'absCount',
            field: 'abs_count',
            validate(req: YemotRequest) {
                return req.params.absCount >= 0 && req.params.absCount <= req.params.howManyLessons;
            }
        }
    ]

    beforeEach(() => {
        req = {
            params: {
                userId: "user123",
                klass: { data: { id: "klass123" } },
                lesson: { data: { id: "lesson123" } },
                isCurrentMonth: "1",
            },
            getUser: jest.fn(),
        } as unknown as YemotRequest;

        res = new YemotResponseMock();
        jest.spyOn(res, 'send');

        next = jest.fn();

        chain = getReportChain(getExistingReports, 'att', properties);
    });

    describe("GetSheetNameHandler", () => {
        beforeEach(() => {
            chain.handlers.length = 1;
        });

        it("should call next if sheetName is already defined", () => {
            req.params.sheetName = "someSheetName";

            chain.handleRequest(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.send).not.toHaveBeenCalled();
            expect(req.params.sheetName).toEqual("someSheetName");
        });

        it("should ask if current month if isCurrentMonth is not defined", async () => {
            req.params.isCurrentMonth = undefined;

            chain.handleRequest(req, res, next);

            const response = await res.getResponse();
            expect(response).toEqual(util.read_v2("askIsCurrentMonth", "isCurrentMonth"));
            expect(next).not.toHaveBeenCalled();
        });

        it("should set sheetName to current month if isCurrentMonth is '1'", () => {
            chain.handleRequest(req, res, next);

            expect(res.send).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
            expect(req.params.sheetName).toEqual(expect.any(String));
        });

        it("should ask for current month if isCurrentMonth is not '1'", async () => {
            req.params.isCurrentMonth = "0";

            chain.handleRequest(req, res, next);

            const response = await res.getResponse();
            expect(response).toEqual(util.read_v2("askForCurrentMonth", "currentMonth"));
            expect(next).not.toHaveBeenCalled();
        });

        it("should set sheetName to requested month if currentMonth is defined", () => {
            req.params.currentMonth = "3";

            chain.handleRequest(req, res, next);

            expect(res.send).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
            expect(req.params.sheetName).toEqual(expect.any(String));
        });

        it("should call next if sheetName is not defined", async () => {
            req.params.sheetName = undefined;
            req.params.isCurrentMonth = '2';
            req.params.currentMonth = '3';

            chain.handleRequest(req, res, next);

            const response = await res.getResponse();
            expect(response).toEqual("");
            expect(next).toHaveBeenCalled();
        });
    });


    describe('GetExistingReportsHandler', () => {
        beforeEach(() => {
            req.params.sheetName = 'someSheetName';
            chain.handlers.length = 2;
            getExistingReports.mockClear();
        });

        it('should call getExistingReports if existingReports param is not defined', async () => {
            await chain.handleRequest(req, res, next);

            expect(getExistingReports).toHaveBeenCalledWith(req, req.params.klass.data.id, req.params.lesson.data.id, req.params.sheetName);
            expect(next).toHaveBeenCalled();
            expect(req.params.existingReports).toEqual(expect.any(Array));
        });

        it('should not call getExistingReports if existingReports param is already defined', async () => {
            req.params.existingReports = [];

            await chain.handleRequest(req, res, next);

            expect(getExistingReports).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });
    });

    describe('CheckExistingReportsHandler', () => {
        beforeEach(() => {
            req.params.sheetName = 'someSheetName';
            req.params.existingReports = [{ studentReferenceId: '123' }, { studentReferenceId: '456' }];
            chain.handlers.length = 3;
        });

        it('should ask if skip existing reports if existingReports has items and isSkipExistingReports is not defined', async () => {
            await chain.handleRequest(req, res, next);

            const response = await res.getResponse();
            expect(response).toEqual(util.read_v2("askIfSkipExistingReports", "isSkipExistingReports"));
            expect(next).not.toHaveBeenCalled();
        });

        it('should not ask if skip existing reports if existingReports is empty', async () => {
            req.params.existingReports = [];

            await chain.handleRequest(req, res, next);

            expect(res.send).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });

        it('should not ask if skip existing reports if isSkipExistingReports is already defined', async () => {
            req.params.isSkipExistingReports = true;

            await chain.handleRequest(req, res, next);

            expect(res.send).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });

        it('should create idsToSkip set if isSkipExistingReports is "1"', async () => {
            req.params.isSkipExistingReports = '1';

            await chain.handleRequest(req, res, next);

            expect(req.params.idsToSkip).toEqual(['123', '456']);
            expect(next).toHaveBeenCalled();
        });

        it('should create an empty idsToSkip set if isSkipExistingReports is not "1"', async () => {
            req.params.isSkipExistingReports = '0';

            await chain.handleRequest(req, res, next);

            expect(req.params.idsToSkip).toEqual([]);
            expect(next).toHaveBeenCalled();
        });
    });

    describe('CheckHowManyLessonsHandler', () => {
        beforeEach(() => {
            req.params.sheetName = 'someSheetName';
            req.params.existingReports = [];
            chain.handlers.length = 4;
        });

        it("call next if reportType is 'grade'", async () => {
            const chain = getReportChain(getExistingReports, 'grade', properties);
            chain.handlers.length = 4;

            await chain.handleRequest(req, res, next);

            expect(res.send).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });


        it('should ask for how many lessons if howManyLessons param is not defined', async () => {
            await chain.handleRequest(req, res, next);

            const response = await res.getResponse();
            expect(response).toEqual(util.read_v2("howManyLessons", "howManyLessons"));
            expect(next).not.toHaveBeenCalled();
        });

        it('should ask for how many lessons if howManyLessons param is "0"', async () => {
            req.params.howManyLessons = '0';

            await chain.handleRequest(req, res, next);

            const response = await res.getResponse();
            expect(response).toEqual(util.send(
                util.id_list_message_v2("tryAgain"),
                util.read_v2("howManyLessons", "howManyLessons")
            ));
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next if howManyLessons is defined', async () => {
            req.params.howManyLessons = '10';

            await chain.handleRequest(req, res, next);

            expect(res.send).not.toHaveBeenCalled();
            expect(next).toHaveBeenCalled();
        });
    });

    describe('should load student list', () => {
        beforeEach(() => {
            req.params.sheetName = 'someSheetName';
            req.params.existingReports = [];
            req.params.howManyLessons = 2;
            req.params.baseReport = {
                userId: req.params.userId,
                teacherReferenceId: 'teacher1',
                klassReferenceId: req.params.klass.data.id,
                lessonReferenceId: req.params.lesson.data.id,
                reportDate: new Date(),
            };
            chain.handlers.length = 5;
            next.mockClear();
        });

        it('should not load student list if already defined', async () => {
            // Arrange
            req.params.students = [{ tz: '111111111' }, { tz: '222222222' }];

            // Act
            await chain.handleRequest(req, res, next);

            // Assert
            expect(res.send).not.toHaveBeenCalled();
            expect(req.params.students).toEqual([{ tz: '111111111' }, { tz: '222222222' }]);
            expect(next).toHaveBeenCalled();
        });

        it('should load student list if not defined and idsToSkip is empty set', async () => {
            // Arrange
            req.params.students = undefined;
            req.params.idsToSkip = [];
            req.getStudentsByKlassId = jest.fn().mockResolvedValue([{ tz: '111111111' }, { tz: '222222222' }]);

            // Act
            await chain.handleRequest(req, res, next);

            // Assert
            expect(res.send).not.toHaveBeenCalled();
            expect(req.getStudentsByKlassId).toHaveBeenCalledWith(req.params.baseReport.klassReferenceId);
            expect(req.params.students).toEqual([{ tz: '111111111' }, { tz: '222222222' }]);
            expect(next).toHaveBeenCalled();
        });

        it('should load student list if not defined and idsToSkip is filled set', async () => {
            // Arrange
            req.params.students = undefined;
            req.params.idsToSkip = ['333333333'];
            req.getStudentsByKlassId = jest.fn().mockResolvedValue([{ id: '111111111' }, { id: '222222222' }, { id: '333333333' }]);

            // Act
            await chain.handleRequest(req, res, next);

            // Assert
            expect(res.send).not.toHaveBeenCalled();
            expect(req.getStudentsByKlassId).toHaveBeenCalledWith(req.params.baseReport.klassReferenceId);
            expect(req.params.students).toEqual([{ id: '111111111' }, { id: '222222222' }]);
            expect(next).toHaveBeenCalled();
        });
    });

    describe('should iterate students', () => {
        beforeEach(() => {
            req.params.sheetName = 'someSheetName';
            req.params.existingReports = [];
            req.params.howManyLessons = 2;
            req.params.baseReport = {
                userId: req.params.userId,
                teacherReferenceId: 'teacher1',
                klassReferenceId: req.params.klass.data.id,
                lessonReferenceId: req.params.lesson.data.id,
                reportDate: new Date(),
            };
            req.params.students = [{ tz: '111111111' }, { tz: '222222222' }, { tz: '333333333' }];
            chain.handlers.length = 6;
            req.saveReport = jest.fn();
            req.deleteExistingReports = jest.fn();
            next.mockClear();
        });

        it('when there are more students to iterate, should set the current student and call the studentChain', async () => {
            await chain.handleRequest(req, res, next);

            expect(req.params.studentIndex).toBe(0);
            expect(req.params.student).toEqual(req.params.students[0]);
            expect(req.params.existing).toEqual([]);
            expect(next).toHaveBeenCalledTimes(0);
            const response = await res.getResponse();
            expect(response).toEqual(util.send(
                util.id_list_message_v2("nextStudent"),
                util.read_v2("absCount", "absCount")
            ));
        });

        it('when there are no more students to iterate, should call the next handler', async () => {
            req.params.studentIndex = 3;

            await chain.handleRequest(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
        });

        it('when shouldNotAsk is returning true value, should not ask for absCount', async () => {
            properties[0].shouldNotAsk = () => Promise.resolve(true);

            await chain.handleRequest(req, res, next);

            expect(next).toHaveBeenCalledTimes(1);
            const response = await res.getResponse();
            expect(response).toEqual(util.id_list_message_v2("nextStudent"));
            delete properties[0].shouldNotAsk;
        });

        it('when there is an absCount, should validate its value', async () => {
            req.params.absCount = -1;

            await chain.handleRequest(req, res, next);

            expect(req.params.absCountValidation).toBeUndefined();
            expect(next).toHaveBeenCalledTimes(0);
            const response = await res.getResponse();
            expect(response).toEqual(util.send(
                util.id_list_message_v2('tryAgain'),
                util.read_v2("absCount", "absCount")
            ));
        });

        it('when there is a large absCount, should ask again', async () => {
            req.params.absCount = 3;

            await chain.handleRequest(req, res, next);

            expect(req.params.absCountValidation).toBeUndefined();
            expect(next).toHaveBeenCalledTimes(0);
            const response = await res.getResponse();
            expect(response).toEqual(util.send(
                util.id_list_message_v2('tryAgain'),
                util.read_v2("absCount", "absCount")
            ));
        });

        it('when opened a side menu, should ask for direction', async () => {
            req.params.absCount = '*';

            await chain.handleRequest(req, res, next);

            expect(req.params.absCountValidation).toBeUndefined();
            expect(next).toHaveBeenCalledTimes(0);
            const response = await res.getResponse();
            expect(response).toEqual(util.read_v2("sideMenu", "sideMenu"));
        });

        it('when opened a side menu with a direction, should ask for absCount', async () => {
            req.params.absCount = '*';
            req.params.sideMenu = '4';

            await chain.handleRequest(req, res, next);

            expect(req.params.absCountValidation).toBeUndefined();
            expect(req.params.sideMenu).toBeUndefined();
            expect(next).toHaveBeenCalledTimes(0);
        });

        it('when opened a side menu with a direction, should go to next student', async () => {
            req.params.absCount = '*6';

            await chain.handleRequest(req, res, next);

            expect(req.params.studentIndex).toEqual(1);
            expect(next).toHaveBeenCalledTimes(0);
            const response = await res.getResponse();
            expect(response).toEqual(util.send(
                util.id_list_message_v2("nextStudent"),
                util.read_v2("absCount", "absCount")
            ));
        });

        it('when opened a side menu with a direction, should go to prev student', async () => {
            req.params.absCount = '*4';

            await chain.handleRequest(req, res, next);

            expect(req.params.studentIndex).toEqual(0);
            expect(next).toHaveBeenCalledTimes(0);
            const response = await res.getResponse();
            expect(response).toEqual(util.send(
                util.id_list_message_v2("nextStudent"),
                util.read_v2("absCount", "absCount")
            ));
        });

        it('when there is a valid absCount, should save and go to next student', async () => {
            req.params.absCount = 1;
            req.params.studentIndex = 0;

            await chain.handleRequest(req, res, next);

            console.log(req.params)
            expect(req.params.studentIndex).toEqual(1);
            expect(req.saveReport).toHaveBeenCalled();
            expect(next).toHaveBeenCalledTimes(0);
            const response = await res.getResponse();
            expect(response).toEqual(util.send(
                util.id_list_message_v2("nextStudent"),
                util.read_v2("absCount", "absCount")
            ));
        });
    });
});
