import React, { CSSProperties } from "react";
import { TableViewColumn, TableViewItem } from "./TableViewItem";
import TableView from "./TableView";
import { FlowDisplayColumn, FlowMessageBox, FlowOutcome, modalDialogButton } from "flow-component-model";

export default class TableViewRow extends React.Component<any,any> {
    
    messageBox: FlowMessageBox;

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

    showChanges(oldCol: string, newCol: string) {
        const root: TableView = this.props.root;
        const row: TableViewItem = root.rowMap.get(this.props.rowId);

        this.messageBox.showMessageBox(
            row.columns.get("ATTRIBUTE_NAME").value,
            (
                <span>
                    {(row.columns.get(oldCol).value || "[Empty]") + " => " + (row.columns.get(newCol).value || "[Empty]")}
                </span>
            ), 
            [new modalDialogButton("Ok",this.messageBox.hideMessageBox)]
        );
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

        let buttonsLeft: any = buttons;
        let buttonsRight: any;
        if(root.getAttribute("ButtonPositionRight","false").toLowerCase() === "true"){
            buttonsRight = buttons;
            buttonsLeft = undefined;
        }

        let lastColDef: FlowDisplayColumn;
        let infoButton: any;
        row.columns.forEach((col: TableViewColumn) => {
            const colDef: FlowDisplayColumn = root.colMap.get(col.name);
            if(colDef.visible === true){
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
                        className={"table-view-column table-view-column-" + col.name} 
                    >
                        {cell}
                    </div>
                );
            }
            else {
                //if this col is not visible and the previous one was then assume this col is the original value for the last one
                if(lastColDef?.visible===true){
                    //we need to add an info button if values are different
                    if(col.value !== row.columns.get(lastColDef.developerName).value) {
                        let oldCol: string = colDef.developerName;
                        let newCol: string = lastColDef.developerName;
                        infoButton=(
                            <span 
                                className="glyphicon glyphicon-info-sign table-view-icon"
                                title="Value change details"
                                onClick={(e: any) => {this.showChanges(oldCol,newCol)}}
                            />
                        );
                        selectedClass = " table-view-row-modified";
                    }
                }
                content.push(
                    <div
                        className="table-view-column-buttons"
                    >
                        {infoButton}
                    </div>
                );
            }
            lastColDef = colDef;
        });
        
        return (
            <div
                className={"table-view-row" + selectedClass}
                onClick={(e: any) => {root.doOutcome("OnSelect",row.id)}}
                style={style}
            >
                <FlowMessageBox
                    parent={this}
                    ref={(element: FlowMessageBox) => {this.messageBox = element}}
                />
                <div
                    className={"table-view-row-buttons" + selectedClass}
                >
                    {buttonsLeft}
                </div>
                <div
                    className={"table-view-row-columns" + selectedClass}
                    onClick={(e: any) => {root.doOutcome("OnSelect",row.id)}}
                >
                    {content}
                </div>
                <div
                    className={"table-view-row-buttons" + selectedClass}
                >
                    {buttonsRight}
                </div>
            </div>
        );
    }
}