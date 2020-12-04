import { eContentType, FlowObjectData } from "flow-component-model";

export class DataGridItem {
    id: string;
    columns: Map<any,DataGridColumn> = new Map();
    objectData: FlowObjectData;
}

export class DataGridColumn {
    name: string ;
    type: eContentType;
    label: string;
    value: any;

    constructor(name: string, label: string, type: eContentType, value: any) {
        this.name=name;
        this.type=type;
        this.value=value;
    }
}