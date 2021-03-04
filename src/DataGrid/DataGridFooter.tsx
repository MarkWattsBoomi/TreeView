import { FlowDisplayColumn, FlowObjectData } from "flow-component-model";
import React from "react";
import DataGrid from "./DataGrid";
import { DataGridItem } from "./DataGridItem";

export default class DataGridFooter extends React.Component<any,any> {
    
    render() {
        const root: DataGrid = this.props.root;
        const col: FlowDisplayColumn = root.colMap.get(this.props.colId)

        //get summary cols
        let cols: string[] = root.getAttribute("SummaryColumns","").split(/[,;]+/);
        let summaryCols: Map<string,any> = new Map();
        cols.forEach((col: string) => {
            let label: string = col.substr(0,col.indexOf("{")).trim();
            let developerName: string[] = RegExp(/{{([^}]*)}}/).exec(col);
            summaryCols.set(developerName[1] , {developerName: developerName[1],label: label});
        });
        


        //build summary vals
        let summaryVals: Map<string,any> = new Map();

        root.colMap.forEach((col: FlowDisplayColumn) => {
            let val: number = undefined;
            if(summaryCols.has(col.developerName)) {
                val=0;
            }
            summaryVals.set(col.developerName,val);
        }) 

        root.rowMap.forEach((node: DataGridItem) => {
            let objData: FlowObjectData = node.objectData;
            summaryCols.forEach((col: any) => {
                summaryVals.set(col.developerName,summaryVals.get(col.developerName) + (node.objectData.properties[col.developerName].value as number));
            });
        });

        let tds: any[] = [];
        if(root.getAttribute("ButtonPositionRight","false").toLowerCase() !== "true"){
            tds.push(
                <td
                    className={"data-grid-table-footer-cell"} 
                />
            );
        }
        root.colMap.forEach((col: FlowDisplayColumn) => {
            tds.push(
                <td
                    className={"data-grid-table-footer-cell data-grid-table-footer-cell-" + col.developerName}
                >
                    <span
                        className={"data-grid-table-footer-cell-label data-grid-table-footer-cell-label-" + col.developerName}
                    >
                        {summaryCols.get(col.developerName)?.label}
                    </span>
                    <span
                        className={"data-grid-table-footer-cell-value data-grid-table-footer-cell-value-" + col.developerName}
                    >
                        {summaryVals.get(col.developerName)?.toFixed(2).toString()}
                    </span>
                </td>
            );
        });

        if(root.getAttribute("ButtonPositionRight","false").toLowerCase() === "true"){
            tds.push(
                <td
                    className={"data-grid-table-footer-cell"} 
                />
            );
        }

        return (
            <tr
                className="data-grid-table-footer-row"
            >
                {tds}
            </tr>
        );
    }
}
