import React, { CSSProperties } from "react";
import { SelectViewColumn, SelectViewItem } from "./SelectViewItem";
import SelectView from "./SelectView";
import { FlowDisplayColumn, FlowOutcome, MessageBox, modalDialogButton } from "flow-component-model";

export default class SelectViewRow extends React.Component<any,any> {
    
    //msgboxVisible: boolean = false;
    //msgboxTitle: string = '';
    //msgboxButtons: any = [];
    //msgboxContent: any;
    //msgboxOnClose: any;

    constructor(props: any) {
        super(props);
        //this.showMessageBox = this.showMessageBox.bind(this);
        //this.hideMessageBox = this.hideMessageBox.bind(this);
        this.selected = this.selected.bind(this);
    }

    /*
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
    */

    selected(e: any) {
        e.stopPropagation();
        const root: SelectView = this.props.root;
        root.rowSelected(this.props.rowId);
    }

    render() {
        const root: SelectView = this.props.root;
        const row: SelectViewItem = root.rowMap.get(this.props.rowId);
        

        let content: any = [];
        let buttons: any = [];

        let selectedClass: string = "";
        if(root.selectedRows.has(row.id)) {
            selectedClass = " select-view-row-selected";
        }
        if(root.modifiedRows.has(row.id)) {
            selectedClass = " select-view-row-modified";
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
        else{
            style.visibility="visible";
        }

        Object.keys(root.outcomes).forEach((key: string) => {
            const outcome: FlowOutcome = root.outcomes[key];
            if (outcome.isBulkAction === false && outcome.developerName !== "OnSelect" && !outcome.developerName.toLowerCase().startsWith("cm")) {
                buttons.push(
                    <span 
                        key={key}
                        className={"glyphicon glyphicon-" + (outcome.attributes["icon"]?.value || "plus") + " select-view-body-column-button"} 
                        title={outcome.label || key}
                        onClick={(e: any) => {e.stopPropagation(); root.doOutcome(key, row.id)}}
                    />
                );
            }
        });

        if(root.model.multiSelect === true) {
            content.push(
                <td 
                    className = "select-view-table-body-check-column"
                >
                    <input
                        className="select-view-check-box" 
                        type="checkbox"
                        checked={root.selectedRows.has(row.id)}
                        onClick={this.selected}
                    /> 
                </td>
            );
        }

        if(root.getAttribute("ButtonPositionRight","false").toLowerCase() !== "true"){
            content.push(
                <td
                    className = "select-view-table-buttons-body"
                >
                    {buttons}
                </td>
            );
        }

        row.columns.forEach((col: SelectViewColumn) => {
            const colDef: FlowDisplayColumn = root.colMap.get(col.name);
            if(colDef.visible === true){
                content.push(
                    <td
                        className="select-view-table-body-column"
                    >
                        <label
                            className="select-view-table-body-column-label"
                        >
                            {col.value}
                        </label>
                    </td>
                );
            }
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
        if (root.msgboxVisible === true) {
            msgbox = (
                <MessageBox
                    title={root.msgboxTitle}
                    buttons={root.msgboxButtons}
                    onClose={root.msgboxOnClose}
                >
                    {root.msgboxContent}
                </MessageBox>
            );
        }

        return (
            <tr
                className={"select-view-table-row" + selectedClass}
                onClick={this.selected}
                style={style}
            >
                {msgbox}
                {content}
                
            </tr>


        );

        /*
        <div
                className={"select-view-row" + selectedClass}
                onClick={(e: any) => {root.doOutcome("OnSelect",row.id)}}
                style={style}
            >
                {msgbox}
                <div
                    className={"select-view-row-buttons" + selectedClass}
                >
                    {buttonsLeft}
                </div>
                <div
                    className={"select-view-row-columns" + selectedClass}
                    onClick={(e: any) => {root.doOutcome("OnSelect",row.id)}}
                >
                    {content}
                </div>
                <div
                    className={"select-view-row-buttons" + selectedClass}
                >
                    {buttonsRight}
                </div>
            </div>
            */
    }
}