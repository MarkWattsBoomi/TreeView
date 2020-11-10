import { FlowObjectData } from "flow-component-model";

export default class TreeViewItem {
    parentId: number ;
    itemId: number ;
    itemName: string = "";
    itemDescription: string = "";
    itemIcon: string = "";
    itemStatus: string = "";
    itemLevel: number = 0;
    itemType: string = "";
    children: Map<number,TreeViewItem> = new Map();
    objectData: FlowObjectData;

    setItemLevel(level: number) {
        this.itemLevel = level;
        this.children.forEach((child: TreeViewItem) => {
            child.setItemLevel(level + 1);
        });
    }
}