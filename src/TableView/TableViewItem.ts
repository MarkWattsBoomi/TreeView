import { eContentType, FlowObjectData } from "flow-component-model";

export class TableViewItem {
    itemId: any ;
    columns: Map<any,TableViewColumn> = new Map();
    itemType: string = "";
    objectData: FlowObjectData;
}

export class TableViewColumn {
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