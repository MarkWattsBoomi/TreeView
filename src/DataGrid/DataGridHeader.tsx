import { FlowDisplayColumn } from "flow-component-model";
import React from "react";
import DataGrid from "./DataGrid";

export default class DataGridHeader extends React.Component<any,any> {
    
    render() {
        const root: DataGrid = this.props.root;
        const col: FlowDisplayColumn = root.colMap.get(this.props.colId)

        return (
            <th
                className="data-grid-header"
            >
                <span
                    className="data-grid--header-label"
                >
                    {col.label}
                </span>
            </th>
        );
    }
}