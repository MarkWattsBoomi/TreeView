import { FlowObjectData } from 'flow-component-model';
import TreeView from './TreeView';

export default class TreeViewItem {

    static fromObjectData(tv: TreeView, objectData: FlowObjectData): TreeViewItem {
        const tvi: TreeViewItem = new TreeViewItem(tv);
        tvi.itemLevel = 0;
        tvi.id = objectData.internalId;
        tvi.itemId = objectData.properties[tvi.fldItemId]?.value as number;
        tvi.parentItemId = objectData.properties[tvi.fldParentId]?.value as number;
        tvi.itemName = objectData.properties[tvi.fldTitle]?.value as string;
        tvi.itemDescription = objectData.properties[tvi.fldDescription]?.value as string;
        tvi.itemStatus = objectData.properties[tvi.fldStatus]?.value as string;
        tvi.itemLocked = objectData.properties[tvi.fldIsLocked]?.value as string;
        tvi.itemSelectable = objectData.properties[tvi.fldIsSelectable]?.value as string;
        // tvi.itemType = objectData.properties["ITEM_TYPE"]?.value as string;
        tvi.children = new Map();
        tvi.objectData = objectData;
        return tvi;
    }

    static fromJSON(tv: TreeView, json: any): TreeViewItem {
        const tvi: TreeViewItem = new TreeViewItem(tv);
        tvi.itemLevel = 0;
        tvi.id = json[tvi.fldItemId];
        tvi.itemId = json[tvi.fldItemId];
        tvi.parentItemId = json[tvi.fldParentId];
        tvi.itemName = json[tvi.fldTitle];
        tvi.itemDescription = json[tvi.fldDescription];
        tvi.itemStatus = json[tvi.fldStatus];
        tvi.itemLocked = json[tvi.fldIsLocked];
        tvi.itemSelectable = json[tvi.fldIsSelectable];
        tvi.itemType = json.ITEM_TYPE;
        tvi.children = new Map();
        tvi.objectData = json;
        return tvi;
    }
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
        this.fldItemId = tv.getAttribute('IdField', 'ITEM_ID');
        this.fldParentId = tv.getAttribute('ParentField', 'PARENT_ID');
        this.fldSequence = tv.getAttribute('SequenceField', 'SEQUENCE');
        this.fldTitle = tv.getAttribute('TitleField', 'TITLE');
        this.fldDescription = tv.getAttribute('DescriptionField', 'DESCRIPTION');
        this.fldStatus = tv.getAttribute('StatusField', 'STATUS');
        this.fldCount = tv.getAttribute('CountField', 'COUNT');
        this.fldIcon = tv.getAttribute('IconField', 'ICON');
        this.fldIsLocked = tv.getAttribute('IsLockedField', 'IS_LOCKED');
        this.fldIsSelectable = tv.getAttribute('IsSelectableField', 'SELECTABLE_CHILDREN');
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
