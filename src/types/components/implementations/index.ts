import { WinCCOAComponent } from '../WinCCOAComponent';
import { ApiComponent } from './ApiComponent';
import { AsciiManagerComponent } from './AsciiManagerComponent';
import { CtrlComponent } from './CtrlComponent';
import { DataComponent } from './DataComponent';
import { DbManagerComponent } from './DbManagerComponent';
import { DistComponent } from './DistComponent';
import { DNP3Component } from './DNP3Component';
import { DriverComponent } from './DriverComponent';
import { EventComponent } from './EventComponent';
import { HttpComponent } from './HttpComponent';
import { IEC60870Component } from './IEC60870Component';
import { IEC61850Component } from './IEC61850Component';
import { JavaScriptComponent } from './JavaScriptComponent';
import { ModbusComponent } from './ModbusComponent';
import { OpcComponent } from './OpcComponent';
import { OpcDaComponent } from './OpcDaComponent';
import { OpcUaComponent } from './OpcUaComponent';
import { PmonComponent } from './PmonComponent';
import { RdbComponent } from './RdbComponent';
import { ReduComponent } from './ReduComponent';
import { ReportManagerComponent } from './ReportManagerComponent';
import { S7Component } from './S7Component';
import { S7TopSapComponent } from './S7TopSapComponent';
import { SimComponent } from './SimComponent';
import { SplitComponent } from './SplitComponent';
import { UIComponent } from './UIComponent';
import { ValueArchManagerComponent } from './ValueArchManagerComponent';
import { VideoDriverComponent } from './VideoDriverComponent';

export { ApiComponent } from './ApiComponent';
export { CtrlComponent } from './CtrlComponent';
export { DataComponent } from './DataComponent';
export { DbManagerComponent } from './DbManagerComponent';
export { DistComponent } from './DistComponent';
export { DNP3Component } from './DNP3Component';
export { DriverComponent } from './DriverComponent';
export { EventComponent } from './EventComponent';
export { HttpComponent } from './HttpComponent';
export { IEC60870Component } from './IEC60870Component';
export { IEC61850Component } from './IEC61850Component';
export { JavaScriptComponent } from './JavaScriptComponent';
export { ModbusComponent } from './ModbusComponent';
export { OpcComponent } from './OpcComponent';
export { OpcDaComponent } from './OpcDaComponent';
export { OpcUaComponent } from './OpcUaComponent';
export { PmonComponent } from './PmonComponent';
export { RdbComponent } from './RdbComponent';
export { ReduComponent } from './ReduComponent';
export { ReportManagerComponent } from './ReportManagerComponent';
export { S7Component } from './S7Component';
export { S7TopSapComponent } from './S7TopSapComponent';
export { SimComponent } from './SimComponent';
export { SplitComponent } from './SplitComponent';
export { UIComponent } from './UIComponent';
export { ValueArchManagerComponent } from './ValueArchManagerComponent';
export { VideoDriverComponent } from './VideoDriverComponent';

/**
 * Get all available WinCC OA components. This list contains all possible components independent of the actual WinCC OA version.
 * The caller can then set the version and check existence on each component.
 * @returns Array of WinCCOAComponent instances for all available components
 */
export function getAllComponents(): WinCCOAComponent[] {
    return [
        new ApiComponent(),
        new AsciiManagerComponent(),
        new CtrlComponent(),
        new DataComponent(),
        new DbManagerComponent(),
        new DistComponent(),
        new DNP3Component(),
        new DriverComponent(),
        new EventComponent(),
        new HttpComponent(),
        new IEC60870Component(),
        new IEC61850Component(),
        new JavaScriptComponent(),
        new ModbusComponent(),
        new OpcComponent(),
        new OpcDaComponent(),
        new OpcUaComponent(),
        new PmonComponent(),
        new RdbComponent(),
        new ReduComponent(),
        new ReportManagerComponent(),
        new S7Component(),
        new S7TopSapComponent(),
        new SimComponent(),
        new SplitComponent(),
        new UIComponent(),
        new ValueArchManagerComponent(),
        new VideoDriverComponent(),
    ];
}
