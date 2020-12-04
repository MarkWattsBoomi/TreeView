import React, { CSSProperties } from "react";

import DataGrid from "./DataGrid";
import { FlowDisplayColumn, FlowOutcome, modalDialogButton } from "flow-component-model";
import { MessageBox } from "../MessageBox/MessageBox";
import { DataGridColumn, DataGridItem } from "./DataGridItem";

export default class DataGridRow extends React.Component<any,any> {
    
    msgboxVisible: boolean = false;
    msgboxTitle: string = '';
    msgboxButtons: any = [];
    msgboxContent: any;
    msgboxOnClose: any;

    constructor(props: any) {
        super(props);
        this.valueChanged = this.valueChanged.bind(this);
        this.showMessageBox = this.showMessageBox.bind(this);
        this.hideMessageBox = this.hideMessageBox.bind(this);
    }

    async showMessageBox(title: string, content: any, onClose: any, buttons: modalDialogButton[]) {
        this.msgboxVisible = true;
        this.msgboxTitle = title;
        this.msgboxContent = content;
        this.msgboxOnClose = onClose;
        this.msgboxButtons = buttons;
        return this.forceUpdate();
    }

    async hideMessageBox() {
        this.msgboxVisible = false;
        this.msgboxTitle = '';
        this.msgboxContent = undefined;
        this.msgboxOnClose = undefined;
        this.msgboxButtons = [];
        return this.forceUpdate();
    }

    valueChanged(e: any, colName: string) {
        const root: DataGrid = this.props.root;
        const row: DataGridItem = root.rowMap.get(this.props.rowId);
        const oldVal: string = row.columns.get(colName).value;
        const newVal: string = e.target.value;

        if(oldVal !== newVal) {
            root.rowValueChanged(this.props.rowId, colName, oldVal, newVal)
        }
    }

    showChanges(oldCol: string, newCol: string) {
        const root: DataGrid = this.props.root;
        const row: DataGridItem = root.rowMap.get(this.props.rowId);

        this.showMessageBox(
            row.columns.get("ATTRIBUTE_NAME").value,
            (
                <span>
                    {(row.columns.get(oldCol).value || "[Empty]") + " => " + (row.columns.get(newCol).value || "[Empty]")}
                </span>
            ), 
            this.hideMessageBox,
            [new modalDialogButton("Ok",this.hideMessageBox)]
        );
    }

    render() {
        const root: DataGrid = this.props.root;
        const row: DataGridItem = root.rowMap.get(this.props.rowId);
        

        let content: any = [];
        let buttons: any = [];

        let selectedClass: string = "";
        if(root.selectedRows.has(row.id)) {
            selectedClass = " data-grid-row-selected";
        }
        if(root.modifiedRows.has(row.id)) {
            selectedClass = " data-grid-row-modified";
        }

        let style: CSSProperties = {};
        //if there's a filter list then hide me if not in it or not in expand list
        if(root.matchingRows.size > 0) {
            if(root.matchingRows.has(row.id) || root.selectedRows.has(row.id)) {
                
            }
            else {
                style.display="none";
            }
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

        if(root.getAttribute("ButtonPositionRight","false").toLowerCase() !== "true"){
            content.push(
                <td
                    className = "select-view-table-buttons-body"
                >
                    {buttons}
                </td>
            );
        }

        let lastColDef: FlowDisplayColumn;
        let infoButton: any;
        row.columns.forEach((col: DataGridColumn) => {
            const colDef: FlowDisplayColumn = root.colMap.get(col.name);
            if(colDef.visible === true){
                let cell: any;
                if(colDef.readOnly === true) {
                    cell = (
                        <label
                            className="data-grid-column-label"
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
                            className="data-grid-column-edit"
                            onBlur={(e: any) => {this.valueChanged(e, col.name)}}
                        />
                    );
                }

                content.push(
                    <div
                        className="data-grid-column"
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
                                className="glyphicon glyphicon-info-sign data-grid-icon"
                                title="Value change details"
                                onClick={(e: any) => {this.showChanges(oldCol,newCol)}}
                            />
                        );
                        selectedClass = " data-grid-row-modified";
                    }
                }
                content.push(
                    <div
                        className="data-grid-column-buttons"
                    >
                        {infoButton}
                    </div>
                );
            }
            lastColDef = colDef;
        });

        if(root.getAttribute("ButtonPositionRight","false").toLowerCase() === "true"){
            content.push(
                <td
                    className = "select-view-table-buttons-body"
                >
                    {buttons}
                </td>
            );
        }
        
        let msgbox: any;
        if (this.msgboxVisible === true) {
            msgbox = (
                <MessageBox
                    title={this.msgboxTitle}
                    buttons={this.msgboxButtons}
                    onClose={this.msgboxOnClose}
                >
                    {this.msgboxContent}
                </MessageBox>
            );
        }

        return (
            <tr
                className={"data-grid-row" + selectedClass}
                onClick={(e: any) => {root.doOutcome("OnSelect",row.id)}}
                style={style}
            >
                {msgbox}
                {content}
            </tr>
        );
    }
}