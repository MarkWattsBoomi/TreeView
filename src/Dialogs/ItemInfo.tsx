import { FlowDisplayColumn } from 'flow-component-model';
import * as React from 'react';
import TreeViewItem from '../TreeView/TreeViewItem';

export default class ItemInfo extends React.Component<any, any> {

    item: TreeViewItem;

    constructor(props: any) {
        super(props);
        this.item = this.props.item;
    }

    render() {

        const rows: any = [];

        const displayColumns: FlowDisplayColumn[] = this.props.display;

        if (displayColumns) {
            displayColumns.forEach((column: FlowDisplayColumn) => {
                rows.push(
                    <div
                    className="modal-dialog-input-row"
                >
                    <span className="modal-dialog-input-label">{column.label || column.developerName}</span>
                    <span className="modal-dialog-input-label">{this.item.itemName}</span>
                </div>,
                );
            });
        }

        return (
            <div
                style={{padding: '5px'}}
            >
                <div
                    className="modal-dialog-input-row"
                >
                    <span className="modal-dialog-input-label">Item Id</span>
                    <span className="modal-dialog-input-label">{this.item.itemId}</span>
                </div>
                <div
                    className="modal-dialog-input-row"
                >
                    <span className="modal-dialog-input-label">Name</span>
                    <span className="modal-dialog-input-label">{this.item.itemName}</span>
                </div>
                <div
                    className="modal-dialog-input-row"
                >
                    <span className="modal-dialog-input-label">Description</span>
                    <span className="modal-dialog-input-label">{this.item.itemDescription}</span>
                </div>
                <div
                    className="modal-dialog-input-row"
                >
                    <span className="modal-dialog-input-label">Type</span>
                    <span className="modal-dialog-input-label">{this.item.itemType}</span>
                </div>
            </div>
        );
    }
}
