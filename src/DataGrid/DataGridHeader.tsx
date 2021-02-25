import { FlowDisplayColumn } from "flow-component-model";
import React from "react";
import DataGrid from "./DataGrid";

export default class DataGridHeader extends React.Component<any,any> {
    
    render() {
        const root: DataGrid = this.props.root;
        const col: FlowDisplayColumn = root.colMap.get(this.props.colId)

        return (
            <th
                className={"data-grid-table-header data-grid-table-header-" + col.developerName}
            >
                <span
                    className="data-grid-table-header-label"
                >
                    {col.label}
                </span>
            </th>
        );
    }
}