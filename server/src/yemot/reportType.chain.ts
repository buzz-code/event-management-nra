import { Chain, HandlerBase, IHandler } from "@shared/utils/yemot/chain.interface";
import { YemotRequest, YemotResponse } from "@shared/utils/yemot/yemot.interface";

class CheckIfReportTypeDefinedHandler extends HandlerBase {
    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params.reportType !== undefined) {
            return next();
        } else {
            return res.send(res.getText('getReportType'), 'reportType');
        }
    }
}

class UseAttReportChainHandler extends HandlerBase {
    constructor(private attReportChain: IHandler) {
        super();
    }

    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params.reportType === '1') {
            return this.attReportChain.handleRequest(req, res, next);
        }
        return next();
    }
}

class UseGradeReportChainHandler extends HandlerBase {
    constructor(private gradeReportChain: IHandler) {
        super();
    }

    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params.reportType === '2') {
            return this.gradeReportChain.handleRequest(req, res, next);
        }
        return next();
    }
}

export default function getReportTypeChain(attReportChain: Chain, gradeReportChain: Chain) {
    return new Chain('get report type chain', [
        new CheckIfReportTypeDefinedHandler(),
        new UseAttReportChainHandler(attReportChain),
        new UseGradeReportChainHandler(gradeReportChain),
    ]);
}
