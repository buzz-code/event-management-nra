import { pascalCase } from "change-case";
import { Chain, HandlerBase } from "@shared/utils/yemot/chain.interface";
import { YemotRequest, YemotResponse } from "@shared/utils/yemot/yemot.interface";

class CheckIfResourceDefinedHandler extends HandlerBase {
    constructor(private resource: string) { super(); }

    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (!req.params[this.resource]) {
            req.params[this.resource] = {};
        }
        if (req.params[this.resource].data !== undefined) {
            // Exit the chain early if resource is already defined
            res.clear();
            return next(true);
        } else {
            return next();
        }
    }
}

class AskForResourceIdHandler extends HandlerBase {
    constructor(private resource: string) { super(); }

    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params[this.resource + 'Id'] === undefined) {
            delete req.params[this.resource].dataToConfirm;
            return res.send(res.getText(`type${pascalCase(this.resource)}Id`), this.resource + 'Id');
        }
        res.clear();
        return next();
    }
}

class GetResourceFromResourceIdHandler extends HandlerBase {
    constructor(private resource: string, private getResource: (req: YemotRequest) => Promise<any>) { super(); }

    async handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params[this.resource].dataToConfirm === undefined) {
            const resource = await this.getResource(req);
            req.params[this.resource].dataToConfirm = resource;
        }
        return next();
    }
}

class AskForResourceConfirmHandler extends HandlerBase {
    constructor(private resource: string) { super(); }

    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params[this.resource + 'Confirm'] === undefined) {
            if (req.params[this.resource].dataToConfirm) {
                delete req.params[this.resource].data;
                return res.send(res.getText(`confirm${pascalCase(this.resource)}`, req.params[this.resource].dataToConfirm.name), this.resource + 'Confirm');
            } else {
                // If resource is null, ask for resource ID again
                delete req.params[this.resource + 'Id'];
                delete req.params[this.resource].dataToConfirm;
                res.send(res.getText('tryAgain'));
                return res.send(res.getText(`type${pascalCase(this.resource)}Id`), this.resource + 'Id');
            }
        }
        return next();
    }
}

class ConfirmResourceHandler extends HandlerBase {
    constructor(private resource: string) { super(); }

    handleRequest(req: YemotRequest, res: YemotResponse, next: Function) {
        if (req.params[this.resource + 'Confirm'] === '1') {
            // Set the resource and exit the chain if confirmed
            req.params[this.resource].data = req.params[this.resource].dataToConfirm;
            delete req.params[this.resource].dataToConfirm;
            return next();
        } else {
            // If not confirmed, ask for resource ID again
            delete req.params[this.resource + 'Id'];
            delete req.params[this.resource].dataToConfirm;
            delete req.params[this.resource + 'Confirm'];
            return res.send(res.getText(`type${pascalCase(this.resource)}Id`), this.resource + 'Id');
        }
    }
}

// Create the chain with the appropriate handlers
export default function getResourceConfirmationChain(resource: string, getResource: (req: YemotRequest) => Promise<any>) {
    return new Chain('resource with confirmation', [
        new CheckIfResourceDefinedHandler(resource),
        new AskForResourceIdHandler(resource),
        new GetResourceFromResourceIdHandler(resource, getResource),
        new AskForResourceConfirmHandler(resource),
        new ConfirmResourceHandler(resource),
    ]);
}
