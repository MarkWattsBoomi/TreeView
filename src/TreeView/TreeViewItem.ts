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

    isEnabled(): boolean {
        if(this.itemStatus && this.itemStatus.length > 0){
            switch(this.itemStatus.toUpperCase()) {
                case "LOCKED":
                case "DISABLED":
                case "READONLY":
                    return false;
                
                case "UNLOCKED":
                case "ENABLED":
                case "EDITABLE":
                case "WRITABLE":
                    return true;

                default:
                    return true;
            }
        }
        else {
            return true;
        }
    }

    getStyle() : string {
        if(this.itemStatus && this.itemStatus.length > 0){
            return "nodestyle_" + this.itemStatus.toLowerCase();
        }
        else {
            return "";
        }
    }
}