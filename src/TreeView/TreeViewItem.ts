import { FlowObjectData } from 'flow-component-model';
import TreeView from './TreeView';

export class TreeViewConfig {
    fldItemId: string;
    fldParentId: string;
    fldSequence: string;
    fldTitle: string;
    fldDescription: string;
    fldStatus: string;
    fldCount: string;
    fldIcon: string;
    fldIsLocked: string;
    fldIsSelectable: string;

    constructor(tv: TreeView) {
        this.fldItemId = tv.getAttribute('idProperty', 'ITEM_ID');
        this.fldParentId = tv.getAttribute('parentProperty', 'PARENT_ID');
        this.fldSequence = tv.getAttribute('sequenceProperty', 'SEQUENCE');
        this.fldTitle = tv.getAttribute('titleProperty', 'TITLE');
        this.fldDescription = tv.getAttribute('descriptionProperty', 'DESCRIPTION');
        this.fldStatus = tv.getAttribute('statusProperty', 'STATUS');
        this.fldCount = tv.getAttribute('countProperty', 'COUNT');
        this.fldIcon = tv.getAttribute('iconProperty', 'ICON');
        this.fldIsLocked = tv.getAttribute('lockedProperty', 'IS_LOCKED');
        this.fldIsSelectable = tv.getAttribute('selectableProperty', 'SELECTABLE_CHILDREN');
    }

}

export default class TreeViewItem {

    id: string;
    parentId: string ;
    parentItemId: number ;
    itemId: number ;
    itemName: string = '';
    itemDescription: string = '';
    itemIcon: string = '';
    itemStatus: string = '';
    itemLocked: string = '';
    itemSelectable: string = '';
    itemLevel: number = 0;
    itemType: string = '';
    children: Map<number, TreeViewItem> = new Map();
    objectData: FlowObjectData;

    static fromObjectData(config: TreeViewConfig, objectData: FlowObjectData): TreeViewItem {
        const tvi: TreeViewItem = new TreeViewItem();
        tvi.itemLevel = 0;
        tvi.id = objectData.internalId;
        tvi.itemId = objectData.properties[config.fldItemId]?.value as number;
        tvi.parentItemId = objectData.properties[config.fldParentId]?.value as number;
        tvi.itemName = objectData.properties[config.fldTitle]?.value as string;
        tvi.itemDescription = objectData.properties[config.fldDescription]?.value as string;
        tvi.itemStatus = objectData.properties[config.fldStatus]?.value as string;
        tvi.itemLocked = objectData.properties[config.fldIsLocked]?.value as string;
        tvi.itemSelectable = objectData.properties[config.fldIsSelectable]?.value as string;
        tvi.itemIcon = objectData.properties[config.fldIcon]?.value as string;
        tvi.children = new Map();
        tvi.objectData = objectData;
        return tvi;
    }

    static fromJSON(config: TreeViewConfig, json: any): TreeViewItem {
        const tvi: TreeViewItem = new TreeViewItem();
        tvi.itemLevel = 0;
        tvi.id = json[config.fldItemId];
        tvi.itemId = json[config.fldItemId];
        tvi.parentItemId = json[config.fldParentId];
        tvi.itemName = json[config.fldTitle];
        tvi.itemDescription = json[config.fldDescription];
        tvi.itemStatus = json[config.fldStatus];
        tvi.itemLocked = json[config.fldIsLocked];
        tvi.itemSelectable = json[config.fldIsSelectable];
        tvi.itemType = json.ITEM_TYPE;
        tvi.children = new Map();
        tvi.objectData = json;
        return tvi;
    }
    
    setItemLevel(level: number) {
        this.itemLevel = level;
        this.children.forEach((child: TreeViewItem) => {
            child.setItemLevel(level + 1);
        });
    }

    isEnabled(): boolean {
        let enabled: boolean = true;
        if (this.itemStatus && this.itemStatus.length > 0) {
            switch (this.itemStatus.toUpperCase()) {
                case 'LOCKED':
                case 'DISABLED':
                case 'READONLY':
                    enabled = false;
                    break;
            }
        }
        if (this.isSelectable() === false) {
            enabled = false;
        }
        return enabled;
    }

    isSelectable(): boolean {
        let selectable: boolean = true;
        if (this.itemLocked && this.itemLocked.length > 0) {
            switch (this.itemLocked.toUpperCase()) {
                case 'Y':
                case 'YES':
                case 'TRUE':
                    selectable = false;
                    break;
            }
        }

        if (this.itemSelectable && this.itemSelectable.length > 0) {
            switch (this.itemSelectable.toUpperCase()) {
                case 'N':
                case 'NO':
                case 'FALSE':
                    selectable = false;
                    break;
            }
        }

        return selectable;

    }

    getStyle(): string {
        let style: string = '';
        if (this.itemStatus && this.itemStatus.length > 0) {
            style += ' nodestyle_' + this.itemStatus.toLowerCase();
        }

        if (this.isSelectable() === false) {
            style += ' treeview-node-noselect';
        }

        return style;
    }
}
