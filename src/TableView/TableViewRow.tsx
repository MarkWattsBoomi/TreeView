import React, { CSSProperties } from "react";
import { TableViewColumn, TableViewItem } from "./TableViewItem";
import TableView from "./TableView";
import { FlowDisplayColumn, FlowOutcome } from "flow-component-model";

export default class TableViewRow extends React.Component<any,any> {
    
    constructor(props: any) {
        super(props);
        this.valueChanged = this.valueChanged.bind(this);
    }

    valueChanged(e: any, colName: string) {
        const root: TableView = this.props.root;
        const row: TableViewItem = root.rowMap.get(this.props.rowId);
        const oldVal: string = row.columns.get(colName).value;
        const newVal: string = e.target.value;

        if(oldVal !== newVal) {
            root.rowValueChanged(this.props.rowId, colName, oldVal, newVal)
        }
    }

    render() {
        const root: TableView = this.props.root;
        const row: TableViewItem = root.rowMap.get(this.props.rowId);
        

        let content: any = [];
        let buttons: any = [];

        let selectedClass: string = "";
        if(root.selectedRows.has(row.id)) {
            selectedClass = " table-view-row-selected";
        }
        if(root.modifiedRows.has(row.id)) {
            selectedClass = " table-view-row-modified";
        }

        let style: CSSProperties = {};
        //if there's a filter list then hide me if not in it or not in expand list
        if(root.matchingRows.size > 0) {
            if(root.matchingRows.has(row.id) || root.selectedRows.has(row.id)) {
                style.visibility="visible";
            }
            else {
                style.visibility="hidden";
                style.height="0px";
            }
        }
        else{
            style.visibility="visible";
        }

        Object.keys(root.outcomes).forEach((key: string) => {
            const outcome: FlowOutcome = root.outcomes[key];
            if (outcome.isBulkAction === false && outcome.developerName !== "OnSelect" && outcome.developerName !== "OnChange" && !outcome.developerName.toLowerCase().startsWith("cm")) {
                buttons.push(
                    <span 
                        key={key}
                        className={"glyphicon glyphicon-" + (outcome.attributes["icon"]?.value || "plus") + " treeview-node-button"} 
                        title={outcome.label || key}
                        onClick={(e: any) => {e.stopPropagation(); root.doOutcome(key, row.id)}}
                    />
                );
            }
        });

        row.columns.forEach((col: TableViewColumn) => {
            const colDef: FlowDisplayColumn = root.colMap.get(col.name);

            let cell: any;
            if(colDef.readOnly === true) {
                cell = (
                    <label
                        className="table-view-column-label"
                    >
                        {col.value}
                    </label>
                );
            } 
            else {
                cell = (
                    <input
                        type="text"
                        defaultValue={col.value}
                        className="table-view-column-edit"
                        onBlur={(e: any) => {this.valueChanged(e, col.name)}}
                    />
                );
            }

            content.push(
                <div
                    className="table-view-column"
                >
                    {cell}
                </div>
            );
        });
        

        return (
            <div
                className={"table-view-row" + selectedClass}
                onClick={(e: any) => {root.doOutcome("OnSelect",row.id)}}
                style={style}
            >
                <div
                    className={"table-view-row-buttons" + selectedClass}
                >
                    {buttons}
                </div>
                <div
                    className={"table-view-row-columns" + selectedClass}
                    onClick={(e: any) => {root.doOutcome("OnSelect",row.id)}}
                >
                    {content}
                </div>
            </div>
        );
    }
}