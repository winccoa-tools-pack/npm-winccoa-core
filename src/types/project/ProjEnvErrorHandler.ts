import { WinCCOAErrorHandler, WinCCOAErrorHandlerOptions } from '../logs/WinCCOAErrorHandler';

export class ProjEnvErrorHandler extends WinCCOAErrorHandler {
    constructor(opts?: WinCCOAErrorHandlerOptions) {
        super({ ...opts, prefix: opts?.prefix ?? 'ProjEnvProject: ' });
    }
}

export default ProjEnvErrorHandler;
