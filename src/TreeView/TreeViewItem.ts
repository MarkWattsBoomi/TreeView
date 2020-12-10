import { FlowObjectData } from "flow-component-model";

export default class TreeViewItem {
    id: string;
    parentId: string ;
    parentItemId: number ;
    itemId: number ;
    itemName: string = "";
    itemDescription: string = "";
    itemIcon: string = "";
    itemStatus: string = "";
    itemLocked: string = "";
    itemSelectable: string = "";
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
        let enabled: boolean = true;
        if(this.itemStatus && this.itemStatus.length > 0){
            switch(this.itemStatus.toUpperCase()) {
                case "LOCKED":
                case "DISABLED":
                case "READONLY":
                    enabled = false;
                    break;
            }
        }
        if(this.isSelectable() === false) {
            enabled = false;
        }
        return enabled;
    }

    isSelectable(): boolean {
        let selectable: boolean = true;
        if(this.itemLocked && this.itemLocked.length > 0){
            switch(this.itemLocked.toUpperCase()) {
                case "Y":
                case "YES":
                case "TRUE":
                    selectable = false;
                    break;
            }
        }

        if(this.itemSelectable && this.itemSelectable.length > 0){
            switch(this.itemSelectable.toUpperCase()) {
                case "N":
                case "NO":
                case "FALSE":
                    selectable = false;
                    break;
            }
        }

        return selectable;
        
    }


    getStyle() : string {
        let style: string = "";
        if(this.itemStatus && this.itemStatus.length > 0){
            style += " nodestyle_" + this.itemStatus.toLowerCase();
        }

        if(this.isSelectable()===false) {
            style += " treeview-node-noselect";
        }
        
        return style;
    }
}