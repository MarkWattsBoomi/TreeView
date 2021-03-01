import React, { CSSProperties } from "react";

import DataGrid from "./DataGrid";
import { eContentType, FlowDisplayColumn, FlowOutcome, modalDialogButton } from "flow-component-model";
import { DataGridColumn, DataGridItem } from "./DataGridItem";

export default class DataGridRow extends React.Component<any,any> {
    
    constructor(props: any) {
        super(props);
        this.valueChanged = this.valueChanged.bind(this);
    }

   

    valueChanged(e: any, colName: string) {
        const root: DataGrid = this.props.root;
        const row: DataGridItem = root.rowMap.get(this.props.rowId);
        let oldVal: any = row.columns.get(colName).value;
        let newVal: any; 

        switch(row.columns.get(colName).type) {
            case eContentType.ContentNumber:
                newVal = parseFloat(e.target.value).toFixed(2);
                if(newVal>99) {
                    newVal = 99;
                }
                break;
            
            default:
                oldVal = e.target.value;
                break;

        }
        
        

        if(oldVal !== newVal) {
            root.rowValueChanged(this.props.rowId, colName, oldVal, newVal)
        }
    }

    showChanges(oldCol: string, newCol: string) {
        const root: DataGrid = this.props.root;
        const row: DataGridItem = root.rowMap.get(this.props.rowId);

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
                        className={"glyphicon glyphicon-" + (outcome.attributes["icon"]?.value || "plus") + " data-grid-column-button"} 
                        title={outcome.label || key}
                        onClick={(e: any) => {
                            e.stopPropagation(); 
                            root.doOutcome(key, row.id)
                        }}
                    />
                );
            }
        });

        if(root.getAttribute("ButtonPositionRight","false").toLowerCase() !== "true"){
            content.push(
                <td
                    className = "data-grid-table-buttons-column"
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
                            onBlur={(e: any) => {
                                e.stopPropagation(); 
                                this.valueChanged(e, col.name);
                            }}
                        />
                    );
                }

                content.push(
                    <td
                        className={"data-grid-table-column data-grid-table-column-" + col.name}
                    >
                        {cell}
                    </td>
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
                        className="data-grid-table-buttons-column"
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
                    className = "data-grid-table-buttons-column"
                >
                    {buttons}
                </td>
            );
        }
        
        return (
            <tr
                className={"data-grid-table-row" + selectedClass}
                //onClick={(e: any) => {root.doOutcome("OnSelect",row.id)}}
                style={style}
            >
                {content}
            </tr>
        );
    }
}