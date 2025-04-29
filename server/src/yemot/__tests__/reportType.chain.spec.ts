import getReportChain from '../attReport.chain';
import { YemotRequest, YemotResponse, YemotResponseMock } from "@shared/utils/yemot/yemot.interface";
import getReportTypeChain from '../reportType.chain';
import util from '@shared/utils/yemot/yemot.util';

async function getExistingReports(req: YemotRequest, klassId: string, lessonId: string, sheetName: string) {
    return [];
}
const attReportChain = getReportChain(getExistingReports, 'att', []);
const gradeReportChain = getReportChain(getExistingReports, 'grade', []);
const reportTypeChain = getReportTypeChain(attReportChain, gradeReportChain);

describe('reportChain', () => {
    let req: YemotRequest;
    let res: YemotResponse;
    const next = jest.fn();
    beforeEach(() => {
        req = { params: {} } as YemotRequest;
        res = new YemotResponseMock();
        next.mockClear();
    });

    it('should return askForReportType if reportType is undefined', async () => {
        await reportTypeChain.handleRequest(req, res, next);

        const response = await res.getResponse();
        expect(response).toEqual(util.read_v2('getReportType', 'reportType'));
        expect(next).not.toHaveBeenCalled();
    });

    it('should use attReportChain if reportType is 1', async () => {
        req.params.reportType = '1';
        const attReportChainMock = jest.spyOn(attReportChain, 'handleRequest');
        await reportTypeChain.handleRequest(req, res, next);

        expect(attReportChainMock).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should use gradeReportChain if reportType is 2', async () => {
        req.params.reportType = '2';
        const gradeReportChainMock = jest.spyOn(gradeReportChain, 'handleRequest');
        await reportTypeChain.handleRequest(req, res, next);

        expect(gradeReportChainMock).toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it('should go on if reportType is 3', async () => {
        req.params.reportType = '3';
        await reportTypeChain.handleRequest(req, res, next);

        expect(next).toHaveBeenCalled();
    });
});
