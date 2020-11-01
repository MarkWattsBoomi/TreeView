import { FlowObjectData } from "flow-component-model";

export default class TreeViewItem {
    itemId: string = "";
    itemName: string = "";
    itemDescription: string = "";
    itemIcon: string = "";
    itemStatus: string = "";
    itemLevel: number = 0;
    children: Map<string,TreeViewItem> = new Map();
    objectData: FlowObjectData;

    //constructor(id: string, name: string, description: string, icon: string, children: Map<string, TreeViewItem>) {
    //    this.itemId = id;
    //    this.itemName = name;
    //    this.itemDescription = description;
    //    this.itemIcon = icon;
    //    this.children = children || new Map();
    //}

}