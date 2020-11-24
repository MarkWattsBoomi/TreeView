import { FlowDisplayColumn } from "flow-component-model";
import React from "react";
import SelectView from "./SelectView";

export default class SelectViewHeader extends React.Component<any,any> {
    
    render() {
        const root: SelectView = this.props.root;
        const col: FlowDisplayColumn = root.colMap.get(this.props.colId)

        return (
            <div
                className="table-view-header"
            >
                <span
                    className="table-view-header-label"
                >
                    {col.label}
                </span>
            </div>
        );
    }
}