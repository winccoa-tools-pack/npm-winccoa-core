import { strict as assert } from 'node:assert';

import {
    AndroidComponent,
    ApiComponent,
    AsciiManagerComponent,
    AlertManagerComponent,
    ConfComponent,
    CtrlComponent,
    DataComponent,
    DbManagerComponent,
    DistComponent,
    DNP3Component,
    DriverComponent,
    EventComponent,
    HttpComponent,
    IEC60870Component,
    IEC61850Component,
    IosComponent,
    JavaComponent,
    JavaScriptComponent,
    ModbusComponent,
    OpcComponent,
    OpcDaComponent,
    OpcUaComponent,
    PmonComponent,
    RdbComponent,
    ReduComponent,
    ReportManagerComponent,
    S7Component,
    S7TopSapComponent,
    SimComponent,
    SplitComponent,
    UIComponent,
    ValueArchManagerComponent,
    VideoDriverComponent,
    VisionComponent,
    WebUIComponent
} from '../../dist/types/components/implementations/index.js';

const classes = [
    AndroidComponent,
    ApiComponent,
    AsciiManagerComponent,
    AlertManagerComponent,
    ConfComponent,
    CtrlComponent,
    DataComponent,
    DbManagerComponent,
    DistComponent,
    DNP3Component,
    DriverComponent,
    EventComponent,
    HttpComponent,
    IEC60870Component,
    IEC61850Component,
    IosComponent,
    JavaComponent,
    JavaScriptComponent,
    ModbusComponent,
    OpcComponent,
    OpcDaComponent,
    OpcUaComponent,
    PmonComponent,
    RdbComponent,
    ReduComponent,
    ReportManagerComponent,
    S7Component,
    S7TopSapComponent,
    SimComponent,
    SplitComponent,
    UIComponent,
    ValueArchManagerComponent,
    VideoDriverComponent,
    VisionComponent,
    WebUIComponent
];

for (const C of classes) {
    const inst = new (C as any)();
    const name = inst.getName();
    const desc = inst.getDescription();
    assert.equal(typeof name, 'string');
    assert.ok(name.length > 0, `getName for ${C.name} should not be empty`);
    assert.equal(typeof desc, 'string');
    assert.ok(desc.length > 0, `getDescription for ${C.name} should not be empty`);
}

export {};
