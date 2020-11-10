import React, { CSSProperties } from "react";
import { TableViewColumn, TableViewItem } from "./TableViewItem";
import TableView from "./TableView";
import { FlowOutcome } from "flow-component-model";

export default class TableViewRow extends React.Component<any,any> {
    
    constructor(props: any) {
        super(props);

    }

    render() {
        const root: TableView = this.props.root;
        const row: TableViewItem = root.rowMap.get(this.props.rowId)

        let content: any = [];
        let buttons: any = [];

        let selectedClass: string = "";
        if(row.itemId === (root.selectedRowId ? root.selectedRowId : undefined)) {
            selectedClass = " table-view-row-selected";
        }

        let style: CSSProperties = {};
        //if there's a filter list then hide me if not in it or not in expand list
        if(root.matchingRows) {
            if(root.matchingRows.indexOf(row.itemId)>=0 || root.selectedRowId===row.itemId) {
                style.visibility="visible";
            }
            else {
                style.visibility="hidden";
                style.height="0px";
            }
        }

        Object.keys(root.outcomes).forEach((key: string) => {
            const outcome: FlowOutcome = root.outcomes[key];
            if (outcome.isBulkAction === false && outcome.developerName !== "OnSelect" && !outcome.developerName.toLowerCase().startsWith("cm")) {
                buttons.push(
                    <span 
                        key={key}
                        className={"glyphicon glyphicon-" + (outcome.attributes["icon"]?.value || "plus") + " treeview-node-button"} 
                        title={outcome.label || key}
                        onClick={(e: any) => {e.stopPropagation(); root.doOutcome(key, row)}}
                    />
                );
            }
        });

        row.columns.forEach((col: TableViewColumn) => {
            content.push(
                <div
                    className="table-view-column"
                >
                    <label
                        className="table-view-column-label"
                    >
                        {col.value}
                    </label>
                </div>
            );
        });
        

        return (
            <div
                className={"table-view-row" + selectedClass}
                onClick={(e: any) => {root.doOutcome("OnSelect",row)}}
                style={style}
            >
                <div
                    className={"table-view-row-buttons" + selectedClass}
                >
                    {buttons}
                </div>
                <div
                    className={"table-view-row-columns" + selectedClass}
                    onClick={(e: any) => {root.doOutcome("OnSelect",row)}}
                >
                    {content}
                </div>
            </div>
        );
    }
}