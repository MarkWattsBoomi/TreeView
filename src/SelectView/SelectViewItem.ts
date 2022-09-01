import { eContentType, FlowObjectData } from 'flow-component-model';

export class SelectViewItem {
    id: string;
    columns: Map<any, SelectViewColumn> = new Map();
    objectData: FlowObjectData;
}

export class SelectViewColumn {
    name: string ;
    type: eContentType;
    label: string;
    value: any;

    constructor(name: string, label: string, type: eContentType, value: any) {
        this.name = name;
        this.type = type;
        this.value = value;
    }
}
